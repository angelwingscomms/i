import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { find_user_by_tag, get } from '$lib/db';
import type { User } from '$lib/types';
import { default_user_fields } from '$lib/constants';

const uuidRegex =  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const load: LayoutServerLoad = async ({ params, url }) => {
  let user: User | null = null;

  if (uuidRegex.test(params.user)) {
    // Treat as UUID
    user = await get(params.user, default_user_fields);
    if (!user) throw error(404);
    user.i = params.user
    // Canonical → no redirect
  } else {
    // Treat as username
    user = await find_user_by_tag(params.user);
    if (!user) throw error(404);

    const rest = url.pathname.slice(`/${params.user}`.length);
    throw redirect(301, `/${user.i}${rest}${url.search}`);
  }
  return { user: user as User };
};