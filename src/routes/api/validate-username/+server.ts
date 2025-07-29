import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    const username = data.username?.trim();

    if (!username) {
      return json({
        valid: false,
        error: 'Username is required'
      }, { status: 400 });
    }

    // Check minimum length
    if (username.length < 3) {
      return json({
        valid: false,
        error: 'Username must be at least 3 characters long'
      }, { status: 400 });
    }

    // Check for valid characters (alphanumeric and underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return json({
        valid: false,
        error: 'Username can only contain letters, numbers, and underscores'
      }, { status: 400 });
    }

    // Check if username already exists in database
    const existingUser = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.t, username)
    });

    if (existingUser) {
      return json({
        valid: false,
        error: 'This usertag is already taken'
      }, { status: 400 });
    }

    // Username is valid and available
    return json({
      valid: true
    });
  } catch (error) {
    console.error('Username validation error:', error);
    return json({
      valid: false,
      error: 'An error occurred during validation'
    }, { status: 500 });
  }
};
