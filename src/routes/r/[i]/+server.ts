import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, locals, platform, params }) => {
	const i = platform?.env.R.idFromName(params.i);
	console.log('r i', i);
	const o = platform?.env.R.get(i);
	console.log('r o', o);
	console.log('lwss', locals.ws)
	locals.ws = await o.fetch(new Request(request.url, request));
	return new Response()
};
