import { error, redirect } from '@sveltejs/kit';
import { edit_point } from '$lib/db';
import type { RequestHandler } from './$types';
import { get } from '$lib/db';
import type { Item } from '$lib/types/item';
import { embed } from '$lib/util/embed';
import { collection } from '$lib/constants';

async function upload_files(files: FormDataEntryValue[]): Promise<string[]> {
	if (!files || files.length === 0) return [];
	const fd = new FormData();
	Array.from(files).forEach((f) => {
		if (f instanceof File) fd.append('files', f);
	});
	const res = await fetch('/i/upload', {
		method: 'POST',
		body: fd
	});
	if (!res.ok) return [];
	const { x } = await res.json() as { x: string[] };
	return x || [];
}

export const POST: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	const { i } = params;
	if (!i) return error(400, 'Missing item id');

	const item = await get<Item>(i);
	if (!item || item.s !== 'i' || locals.user.i !== item.u) {
		return error(403, 'Unauthorized');
	}

	const data = await request.formData();
	const t = data.get('t') as string;
	const a = data.get('a') as string;
	const k = Number(data.get('k')) as 0 | 1;
	const v = Number(data.get('v'));
	const m = data.get('m') as string;
	const files = data.getAll('files') as unknown as File[];
	const keep_x_str = data.get('keep_x') as string;
	const kept_x: string[] = keep_x_str ? JSON.parse(keep_x_str) : [];

	const x = await upload_files(files);
	const new_x = x.length > 0 ? [...kept_x, ...x] : kept_x;

	const payload = {
		...item,
		t: t || item.t,
		a,
		k,
		v,
		m,
		x: new_x
	};

	const embed_text = `${t || item.t} ${a || ''}`;
	const vector = await embed(embed_text);

	await edit_point(i, payload);

	// Update vector
	const qdrant = (await import('$lib/db')).qdrant;
	await qdrant.updateVectors(collection, {
		points: [{ id: i, vector }]
	});

	throw redirect(303, `/i/${i}`);
};