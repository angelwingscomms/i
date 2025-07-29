import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    const userId = locals.user?.id;
    if (!userId) {
      return json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Parse request body
    const data = await request.json();
    const description = data.description?.trim();

    // Validate description
    if (!description) {
      return json({
        success: false,
        error: 'Description cannot be empty'
      }, { status: 400 });
    }

    if (description.length > 1000) {
      return json({
        success: false,
        error: 'Description is too long (maximum 1000 characters)'
      }, { status: 400 });
    }

    // Update user description in database
    await db.update(db.table('user'))
      .set({ d: description })
      .where('id', '=', userId)
      .execute();

    // Return success response
    return json({
      success: true,
      message: 'Description updated successfully'
    });
  } catch (error) {
    console.error('Error updating description:', error);
    return json({
      success: false,
      error: 'An error occurred while updating the description'
    }, { status: 500 });
  }
};
