import { error, json } from '@sveltejs/kit';
import { create } from '$lib/db';
import type { RequestHandler } from './$types';
import type { NotificationSubscription } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const subscription: NotificationSubscription = await request.json();
    
    await create(subscription);
    
    return new Response();
  } catch (e) {
    console.error('Error saving notification subscription:', e);
    error(500, 'Failed to save subscription')
  }
};
