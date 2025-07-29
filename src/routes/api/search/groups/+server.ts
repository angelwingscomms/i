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

    // Parse search parameters
    const data = await request.json();
    const { name = '' } = data;

    // Build query conditions
    let query = db.select()
      .from(db.table('group'))
      .limit(50);

    // Add name filter if provided
    if (name && name.trim()) {
      query = query.where('name', 'like', `%${name.trim()}%`);
    }

    // Execute query
    const groups = await query.execute();

    // Get member count for each group (in a real application, this might be a separate column or join)
    const groupsWithMemberCount = await Promise.all(
      groups.map(async (group) => {
        const memberCount = await db.select({ count: db.fn.count() })
          .from(db.table('group_member'))
          .where('groupId', '=', group.id)
          .execute()
          .then(result => result[0]?.count || 0);

        // Check if user is a member of this group
        const userMembership = await db.select()
          .from(db.table('group_member'))
          .where('groupId', '=', group.id)
          .where('userId', '=', userId)
          .execute()
          .then(result => result.length > 0);

        return {
          ...group,
          memberCount,
          isMember: userMembership
        };
      })
    );

    return json({
      success: true,
      groups: groupsWithMemberCount
    });
  } catch (error) {
    console.error('Group search error:', error);
    return json({
      success: false,
      error: 'An error occurred while searching for groups'
    }, { status: 500 });
  }
};
