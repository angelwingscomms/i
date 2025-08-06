import { json } from '@sveltejs/kit';
import { search_by_payload, edit_point } from '$lib/db';
import type { RequestHandler } from './$types';
import type { NotificationSubscription } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { endpoint, userId, schoolId } = await request.json();
    
    // Find and deactivate the subscription
    const subscriptions = await search_by_payload<NotificationSubscription>({
      s: 'n',
      u: userId,
      sc: schoolId,
      e: endpoint
    });

    for (const subscription of subscriptions) {
      if (subscription.id) {
        await edit_point(subscription.id, {
          ...subscription,
          ac: false // Deactivate instead of deleting
        });
      }
    }
    
    return json({ success: true });
  } catch (error) {
    console.error('Error removing notification subscription:', error);
    return json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
};
