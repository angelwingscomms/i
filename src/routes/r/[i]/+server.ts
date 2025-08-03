import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, platform, params }) => {
	const i = platform?.env.R.idFromName(params.i);
	console.log('r i', i)
	const o = platform?.env.R.get(i);
	console.log('r o', o)
	const res = await o.fetch(new Request(request.url, request));
	console.log('platform.env', platform.env, Object.entries(platform.env))
	console.log('r res', res);
	return new Response()
};
