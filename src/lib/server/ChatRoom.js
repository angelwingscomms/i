// src/lib/server/ChatRoom.js

import { save_message } from '$lib/db';

export class ChatRoom {
	constructor(state, env) {
		this.state = state;
		this.env = env;
		this.sessions = []; // Stores active WebSocket connections
	}

	// Handles incoming HTTP requests, primarily to upgrade them to WebSockets
	async fetch(request) {
		const url = new URL(request.url);
		// Assuming userId will be passed as a query parameter
		const userId = url.searchParams.get('userId') || 'anonymous';

		// Create a new WebSocket pair
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		// This will become the server's WebSocket connection.
		server.accept();
		this.sessions.push({ ws: server, u: userId });

		// Add event listeners for the server's WebSocket
		server.addEventListener('message', async (event) => {
			// Create a message object, adhering to single/double letter field names
			const message = {
				u: userId, // User ID
				t: event.data, // Text content of the message
				ts: new Date().toISOString(), // Timestamp
				r: this.state.id.toString() // Room ID (Durable Object ID)
			};

			// Broadcast the message to all connected clients
			this.broadcast(JSON.stringify(message));

			// Save the message to the database using the abstracted function
			try {
				await save_message(message.r, { u: message.u, t: message.t, ts: message.ts });
			} catch (e) {
				console.error('Failed to save message to DB:', e);
				// Optionally send an error back to the user who sent the message
				server.send(JSON.stringify({ system: 'Failed to save your message.' }));
			}
		});

		server.addEventListener('close', () => {
			this.sessions = this.sessions.filter((session) => session.ws !== server);
			this.broadcast(JSON.stringify({ system: `${userId} has left the chat.` }));
		});

		server.addEventListener('error', (err) => {
			console.error('WebSocket error:', err);
		});

		// Return the client's WebSocket endpoint
		return new Response(null, {
			status: 101,
			webSocket: client
		});
	}

	// Helper method to broadcast a message to all connected clients
	broadcast(message) {
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
