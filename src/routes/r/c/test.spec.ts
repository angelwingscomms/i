import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './+server';
import { json, error } from '@sveltejs/kit';

// Mock SvelteKit's json and error helpers
vi.mock('@sveltejs/kit', () => ({
    json: vi.fn((data, options) => {
        // Mock a Response object that resembles what SvelteKit would return
        return {
            status: options?.status || 200,
            json: () => Promise.resolve(data) // Simulate .json() method of Response
        };
    }),
    error: vi.fn((status, message) => {
        // SvelteKit's error helper throws an actual error
        const err = new Error(typeof message === 'string' ? message : 'SvelteKit Error Mock');
        // Attach properties expected to be accessible on the error object for testing
        (err as any).status = status;
        (err as any).body = message; // `body` isn't standard, but useful for testing the message
        return err; // `error` helper returns (and expects you to throw) an Error instance
    })
}));

// Mock the database functions
import * as db from '$lib/db';
vi.mock('$lib/db', () => ({
    edit_point: vi.fn((payload) => Promise.resolve({ ...payload, i: 'mock-uuid' }))
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
    randomUUID: vi.fn(() => 'mock-uuid')
});

describe('Room Creation POST endpoint', () => {
    let mock_request: Request;
    let mock_locals: App.Locals;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        // Default logged-in user mock
        mock_locals = {
            user: { i: 'test-user-id', t: 'testuser', s: 'u' } as any // Type assertion for simplicity in test
        };
    });

    it('should create a room successfully with valid data and return 201', async () => {
        mock_request = new Request('http://localhost/r/c', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_tag: 'Test Room', description: 'A detailed description.' })
        });

        const response = await POST({ request: mock_request, locals: mock_locals });

        expect(db.edit_point).toHaveBeenCalledTimes(1);
        expect(db.edit_point).toHaveBeenCalledWith(
            expect.objectContaining({
                s: 'r',
                t: 'Test Room',
                d: 'A detailed description.',
                c: 'test-user-id',
                a: expect.any(String) // 'a' is a timestamp, should be a string
            })
        );
        expect(response.status).toBe(201);
        const response_body = await response.json();
        expect(response_body).toEqual({ room_id: 'mock-uuid' });
    });

    it('should throw 400 error for missing room_tag', async () => {
        mock_request = new Request('http://localhost/r/c', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_tag: '', description: 'Some description' })
        });

        let thrown_error: any;
        try {
            await POST({ request: mock_request, locals: mock_locals });
        } catch (e) {
            thrown_error = e;
        }

        expect(error).toHaveBeenCalledWith(400, {
            message: 'Validation failed',
            errors: { room_tag: 'Room Tag is required.' }
        });
        expect(thrown_error.status).toBe(400);
        expect(thrown_error.body).toEqual({
            message: 'Validation failed',
            errors: { room_tag: 'Room Tag is required.' }
        });
        expect(db.edit_point).not.toHaveBeenCalled();
    });

    it('should throw 400 error for missing description', async () => {
        mock_request = new Request('http://localhost/r/c', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_tag: 'Valid Tag', description: '' })
        });

        let thrown_error: any;
        try {
            await POST({ request: mock_request, locals: mock_locals });
        } catch (e) {
            thrown_error = e;
        }

        expect(error).toHaveBeenCalledWith(400, {
            message: 'Validation failed',
            errors: { description: 'Description is required.' }
        });
        expect(thrown_error.status).toBe(400);
        expect(thrown_error.body).toEqual({
            message: 'Validation failed',
            errors: { description: 'Description is required.' }
        });
        expect(db.edit_point).not.toHaveBeenCalled();
    });

    it('should throw 400 error for room_tag exceeding max length', async () => {
        mock_request = new Request('http://localhost/r/c', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room_tag: 'a'.repeat(51),
                description: 'Valid description.'
            })
        });

        let thrown_error: any;
        try {
            await POST({ request: mock_request, locals: mock_locals });
        } catch (e) {
            thrown_error = e;
        }

        expect(error).toHaveBeenCalledWith(400, {
            message: 'Validation failed',
            errors: { room_tag: 'Room Tag must be 50 characters or less.' }
        });
        expect(thrown_error.status).toBe(400);
        expect(thrown_error.body).toEqual({
            message: 'Validation failed',
            errors: { room_tag: 'Room Tag must be 50 characters or less.' }
        });
        expect(db.edit_point).not.toHaveBeenCalled();
    });

    it('should throw 400 error for description exceeding max length', async () => {
        mock_request = new Request('http://localhost/r/c', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room_tag: 'Valid Tag',
                description: 'b'.repeat(201)
            })
        });

        let thrown_error: any;
        try {
            await POST({ request: mock_request, locals: mock_locals });
        } catch (e) {
            thrown_error = e;
        }

        expect(error).toHaveBeenCalledWith(400, {
            message: 'Validation failed',
            errors: { description: 'Description must be 200 characters or less.' }
        });
        expect(thrown_error.status).toBe(400);
        expect(thrown_error.body).toEqual({
            message: 'Validation failed',
            errors: { description: 'Description must be 200 characters or less.' }
        });
        expect(db.edit_point).not.toHaveBeenCalled();
    });

    it('should throw 401 error if user is not logged in', async () => {
        mock_locals.user = undefined; // Simulate no logged-in user
        mock_request = new Request('http://localhost/r/c', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_tag: 'Test Room', description: 'A detailed description.' })
        });

        let thrown_error: any;
        try {
            await POST({ request: mock_request, locals: mock_locals });
        } catch (e) {
            thrown_error = e;
        }

        expect(error).toHaveBeenCalledWith(401, 'Unauthorized');
        expect(thrown_error.status).toBe(401);
        expect(thrown_error.body).toBe('Unauthorized');
        expect(db.edit_point).not.toHaveBeenCalled();
    });

    it('should throw 500 error if database operation fails', async () => {
        vi.spyOn(db, 'edit_point').mockRejectedValueOnce(new Error('DB connection failed'));

        mock_request = new Request('http://localhost/r/c', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_tag: 'Test Room', description: 'A detailed description.' })
        });

        let thrown_error: any;
        try {
            await POST({ request: mock_request, locals: mock_locals });
        } catch (e) {
            thrown_error = e;
        }

        expect(error).toHaveBeenCalledWith(500, 'Failed to create room due to an internal server error. Please try again.');
        expect(thrown_error.status).toBe(500);
        expect(thrown_error.body).toBe('Failed to create room due to an internal server error. Please try again.');
        expect(db.edit_point).toHaveBeenCalledTimes(1); // It was called, but failed
    });
});
