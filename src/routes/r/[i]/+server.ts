import { create } from '$lib/db';
import axios from 'axios';
import type { RequestHandler } from './$types';
import { PUBLIC_WORKER } from '$env/static/public';

export const POST: RequestHandler = async ({ request }) => {
  // if (request.headers.get('origin') !== 'http' + 'PUBLIC_WORKER') {
  //  return new Response('Forbidden', { status: 403 });
  // }
	const m = await request.json();
  const i = m.i;
	delete m.i;
  m.s = 'm'

	await create(
		i,
		m,
		JSON.stringify({
			sender: m.ut,
			sent_at: new Date(m.d).toLocaleString(undefined, {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			}),
			message_text: m.mt
		})
	);
	
	await axios.post('http' + PUBLIC_WORKER + '/send/' + m.r, {i, u: m.ut, t: m.mt})

	return new Response();
};
