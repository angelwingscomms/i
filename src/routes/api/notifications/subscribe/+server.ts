import { json } from '@sveltejs/kit';
import { upsertPoint } from '$lib/db';
import type { RequestHandler } from './$types';
import type { NotificationSubscription } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const subscription: NotificationSubscription = await request.json();
    
    let res = await upsertPoint(subscription);
    
    return json({ success: true });
  } catch (error) {
    console.error('Error saving notification subscription:', error);
    return json({ error: 'Failed to save subscription' }, { status: 500 });
  }
};
