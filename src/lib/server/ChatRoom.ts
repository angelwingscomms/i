// i/src/lib/server/ChatRoom.ts

import { save_message } from '$lib/db';

interface Env {
	CHAT_ROOMS: DurableObjectNamespace;
	// Add other bindings if necessary, e.g., if Qdrant client was directly bound here
	// For this setup, save_message is directly imported, so `db` is not needed on `env`
}

interface WebSocketSession {
	ws: WebSocket;
	u: string; // user ID
}

export class ChatRoom {
	state: DurableObjectState;
	env: Env;
	sessions: WebSocketSession[];

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.sessions = []; // Stores active WebSocket connections
	}

	// Handles incoming HTTP requests, primarily to upgrade them to WebSockets
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const user_id = url.searchParams.get('userId') || 'anonymous';
		const room_id = this.state.id.toString(); // Durable Object ID is the room ID

		// Create a new WebSocket pair
		const web_socket_pair = new WebSocketPair();
		const [client_web_socket, server_web_socket] = Object.values(web_socket_pair);

		// This will become the server's WebSocket connection.
		server_web_socket.accept();
		this.sessions.push({ ws: server_web_socket, u: user_id });

		// Add event listeners for the server's WebSocket
		server_web_socket.addEventListener('message', async (event: MessageEvent) => {
			// Create a message object, adhering to single/double letter field names
			const chat_message_payload = {
				u: user_id, // User ID
				t: event.data as string, // Text content of the message
				ts: new Date().toISOString() // Timestamp
			};

			// Broadcast the message to all connected clients
			// The message sent over WebSocket should include the room ID and type for the client to parse
			const broadcast_message = { ...chat_message_payload, r: room_id, s: 'm' };
			this.broadcast(JSON.stringify(broadcast_message));

			// Save the message to the database using the abstracted function
			try {
				await save_message(room_id, chat_message_payload);
			} catch (e) {
				console.error('Failed to save message to DB:', e);
				// Optionally send an error back to the user who sent the message
				server_web_socket.send(JSON.stringify({ system: 'Failed to save your message.' }));
			}
		});

		server_web_socket.addEventListener('close', () => {
			this.sessions = this.sessions.filter((session) => session.ws !== server_web_socket);
			this.broadcast(
				JSON.stringify({
					u: 'system',
					t: `${user_id} has left the chat.`,
					ts: new Date().toISOString(),
					r: room_id,
					s: 'm'
				})
			);
		});

		server_web_socket.addEventListener('error', (err: Event) => {
			console.error('WebSocket error:', err);
			// Attempt to remove the session on error as well
			this.sessions = this.sessions.filter((session) => session.ws !== server_web_socket);
			this.broadcast(
				JSON.stringify({
					u: 'system',
					t: `A user experienced a WebSocket error.`,
					ts: new Date().toISOString(),
					r: room_id,
					s: 'm'
				})
			);
		});

		// Return the client's WebSocket endpoint
		return new Response(null, {
			status: 101,
			webSocket: client_web_socket
		});
	}

	// Helper method to broadcast a message to all connected clients
	broadcast(message: string) {
		this.sessions.forEach((session) => {
			try {
				session.ws.send(message);
			} catch (err) {
				console.error(`Failed to send message to ${session.u}`, err);
				// Remove broken connections
				this.sessions = this.sessions.filter((s) => s.ws !== session.ws);
			}
		});
	}
}
