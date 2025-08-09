import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendPushToUserId } from '$lib/server/push';

export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { i } = params;
    const { t, m, k } = await request.json();
    if (!i) return json({ error: 'missing user id' }, { status: 400 });
    if (!m) return json({ error: 'missing message' }, { status: 400 });

    const res = await sendPushToUserId(i, t || 'Notification', m, k);
    if (!res.ok) return new Response(res.reason, { status: res.status });
    return json({ message: 'Push notification sent' });
  } catch (error) {
    console.error('push_notif error', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};




