import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, platform, params }) => {
  const i = platform?.env.R.idFromName(params.i)
  const o = platform?.env.R.get(i)
  return o.fetch(new Request(request.url, request))
}