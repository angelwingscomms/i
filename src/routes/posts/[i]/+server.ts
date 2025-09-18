import { error } from '@sveltejs/kit';
import type { LocalsUser, Post } from '$lib/types';
import { update_post } from '$lib/db/post';
import { upload_image } from '$lib/integrations/r2_storage';
import type { Platform } from '$lib/integrations/r2_storage';
import { get, delete_by_id } from '$lib/db';

export const PUT = async ({
	params,
	locals,
	request,
	platform
}: {
	params: { i: string };
	locals: { user?: LocalsUser };
	request: Request;
	platform: Platform;
}) => {
	if (!locals.user) return error(401, 'Unauthorized');
	const formData = await request.formData();
	const t =
		(formData.get('t') as string) || undefined;
	const b =
		(formData.get('b') as string) || undefined;
	const file = formData.get('file') as File | null;
	const r = formData.get('r') === 'true';
	let p: string | undefined = undefined;
	if (file && file.size > 0) {
		const uploaded = await upload_image(
			file,
			locals.user.i,
			platform
		);
		p = uploaded;
	} else if (r) {
		p = undefined;
	}
	const update_data: Partial<Post> = { t, b };
	if (p !== undefined) update_data.p = p;
	await update_post(params.i, update_data);
	return new Response();
};

export const DELETE = async ({
	params,
	locals
}: {
	params: { i: string };
	locals: { user?: LocalsUser };
}) => {
	if (!locals.user) return error(401, 'Unauthorized');
	const p = await get<Post>(params.i, ['u', 's']);
	if (!p || p.s !== 'p' || p.u !== locals.user.i) {
		return error(403, "You don't own this post");
	}
	await delete_by_id(params.i);
	return new Response(null, { status: 204 });
};
