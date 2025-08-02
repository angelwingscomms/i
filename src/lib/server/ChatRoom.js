// src/lib/server/ChatRoom.js

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
		const tenantId = url.searchParams.get('tenantId'); // Assuming tenantId will be passed

		if (!tenantId) {
			// Durable Objects fetch method cannot directly return a Response with status 400
			// and close the connection cleanly. We will log the error and let the WebSocket
			// connection fail or be closed by the client if no tenantId is provided.
			// The client-side will need to handle this failure gracefully.
			console.error('ChatRoom: Missing tenantId in WebSocket connection request.');
			// To indicate an error and prevent connection, we can return a non-101 status,
			// which will cause the WebSocket upgrade to fail.
			return new Response('Missing tenant ID', { status: 400 });
		}

		// Create a new WebSocket pair
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		// This will become the server's WebSocket connection.
		server.accept();
		this.sessions.push({ ws: server, u: userId, s: tenantId }); // Use 'u' for userId, 's' for tenantId based on convention

		// Add event listeners for the server's WebSocket
		server.addEventListener('message', async (event) => {
			// Create a message object, adhering to single/double letter field names
			const message = {
				u: userId, // User ID
				t: event.data, // Text content of the message
				ts: new Date().toISOString(), // Timestamp
				s: tenantId, // Tenant ID (service/data type identifier for the DB)
				r: this.state.id.toString(), // Room ID (Durable Object ID)
				st: 'chat_message' // Type of stored data for Qdrant payload
			};

			// Broadcast the message to all connected clients
			this.broadcast(JSON.stringify(message));

			// Save the message to the database using the abstracted function
			// Ensure db is available in env
			if (this.env.db && typeof this.env.db.save_message === 'function') {
				try {
					await this.env.db.save_message(message);
				} catch (e) {
					console.error('Failed to save message to DB:', e);
					// Optionally send an error back to the user who sent the message
					server.send(JSON.stringify({ system: 'Failed to save your message.' }));
				}
			} else {
				console.warn('DB helper function save_message not available in env.');
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
			webSocket: client,
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
				this.sessions = this.sessions.filter((s) => s !== session);
			}
		});
	}
}
