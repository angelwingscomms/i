import { json } from '@sveltejs/kit';
import { searchByPayload } from '$lib/db';
import type { RequestHandler } from './$types';
import type { NotificationSubscription } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const schoolId = url.searchParams.get('schoolId');
    const endpoint = url.searchParams.get('endpoint');
    
    if (!userId || !schoolId || !endpoint) {
      return json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Check if subscription exists in database
    const subscriptions = await searchByPayload<NotificationSubscription>({
      s: 'n',
      u: userId,
      sc: schoolId,
      e: endpoint,
      ac: true
    });
    
    return json({ subscribed: subscriptions.length > 0 });
  } catch (error) {
    console.error('Error checking notification subscription:', error);
    return json({ error: 'Failed to check subscription' }, { status: 500 });
  }
};
