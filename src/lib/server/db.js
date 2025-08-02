// src/lib/server/db.js

import { qdrant, upsertPoint, searchByPayload } from '$lib/db'; // Import existing Qdrant client and helpers
import { collection } from '$lib/constants'; // Qdrant collection name 'i'
import { v7 as uuidv7 } from 'uuid'; // For generating unique IDs

/**
 * Saves a message to the database (Qdrant).
 * Adheres to project conventions: single/double letter field names, 's' for data type, wait: true.
 * @param {object} message - The message object to save.
 *   Expected fields:
 *     - u: User ID (string)
 *     - t: Text content of the message (string)
 *     - ts: Timestamp (ISO string)
 *     - s: Tenant ID/Data type identifier (string, e.g., 'c' for chat message)
 *     - r: Room ID (string)
 *     - st: Stored Type (string, e.g., 'chat_message')
 */
export async function save_message(message) {
	console.log(`Saving message to Qdrant for room ${message.r} with type ${message.s}:`, message);

	// Generate a unique ID for the message point
	const id = uuidv7();

	// Qdrant upsert expects a vector, for chat messages we can use a zero vector for now
	// In a real application, you might embed messages for semantic search.
	const vector = new Array(768).fill(0); // Assuming 768-dimensional vectors based on existing codebase

	try {
		await qdrant.upsert(collection, {
			points: [
				{
					id: id,
					payload: { ...message }, // Payload already contains s, u, t, ts, r, st
					vector: vector
				}
			],
			wait: true // Always use wait: true for write operations
		});
		console.log(`Message saved successfully with ID: ${id}`);
	} catch (error) {
		console.error('Error saving message to Qdrant:', error);
		throw error;
	}
}

/**
 * Retrieves the chat history for a room from the database (Qdrant).
 * @param {string} room_id - The ID of the chat room.
 * @param {string} tenant_id - The tenant ID/data type identifier for the messages (e.g., 'c').
 * @returns {Promise<object[]>} - A promise that resolves to an array of message objects,
 *                                 sorted by timestamp in ascending order.
 */
export async function get_chat_history(room_id, tenant_id) {
	console.log(`Fetching history for room ${room_id} with tenant ID ${tenant_id}`);

	try {
		// Use searchByPayload to filter by room_id and the specific tenant/data type ('s' field)
		// and also by the stored type 'st' to ensure we only get chat messages.
		const messages = await searchByPayload({
			r: room_id,
			s: tenant_id, // Ensure we filter by the correct service/data type
			st: 'chat_message' // Filter specifically for chat messages
		}, 100); // Limit to 100 messages for history

		// Sort messages by timestamp (ts) in ascending order
		messages.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

		return messages;
	} catch (error) {
		console.error(`Error fetching chat history for room ${room_id}:`, error);
		throw error;
	}
}
