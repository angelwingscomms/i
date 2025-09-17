import { json, error } from '@sveltejs/kit';
import type { LocalsUser, Post } from '$lib/types';
import { update_post } from '$lib/db/post';
import { upload_image } from '$lib/integrations/r2_storage';
import type { Platform } from '$lib/integrations/r2_storage';

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
	const { i } = params;
	const formData = await request.formData();
	const m =
		(formData.get('m') as string) || undefined;
	const b =
		(formData.get('b') as string) || undefined;
	const file = formData.get('file') as File | null;
	const remove_image =
		formData.get('remove_image') === 'true';
	let p: string | undefined = undefined;
	if (file && file.size > 0) {
		const uploaded = await upload_image(
			file,
			locals.user.i,
			platform
		);
		p = uploaded;
	} else if (remove_image) {
		p = undefined;
	}
	const update_data: Partial<Post> = { m, b };
	if (p !== undefined) update_data.p = p;
	const updated = await update_post(i, update_data);
	return json({ post: updated });
};
