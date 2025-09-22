import { error, redirect } from '@sveltejs/kit';
import { edit_point } from '$lib/db';
import type { RequestHandler } from './$types';
import { get } from '$lib/db';
import type { Item } from '$lib/types/item';
import { embed } from '$lib/util/embed';
import { collection } from '$lib/constants';
import { upload_image } from '$lib/integrations/r2_storage';

async function upload_files(files: File[], platform: any): Promise<string[]> {
	if (!files || files.length === 0) return [];
	if (!platform?.env?.R2) {
		console.warn('R2 bucket not available, skipping upload');
		return [];
	}

	const urls: string[] = [];
	for (const file of files) {
		try {
			console.log('Edit server: Attempting upload for file:', file.name, file.size);
			const url = await upload_image(file, undefined, platform);
			console.log('Edit server: Upload success for', file.name, 'URL:', url);
			urls.push(url);
		} catch (e) {
			console.error('R2 upload error for', file.name, ':', e);
		}
	}
	return urls;
}

export const POST: RequestHandler = async ({ params, locals, request, platform }) => {
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
	const p = data.get('p') as string || '';
	const m = data.get('m') as string;
	const files = data.getAll('f') as unknown as File[];
	console.log('Edit server: Files received from formData:', files.length, files.map(f => f?.name || 'no name'));
	if (files.length > 0) {
		files.forEach((f, idx) => console.log(`Edit server: File ${idx}: name=${f.name}, size=${f.size}, type=${f.type}`));
	} else {
		console.log('Edit server: No files in formData, full entries:', Array.from(data.entries()).map(([k,v]) => ({k, v: v instanceof File ? 'File' : v})));
	}
	const keep_x_str = data.get('keep_x') as string;
	const kept_x: string[] = keep_x_str ? JSON.parse(keep_x_str) : [];

	console.log('Edit server: Calling upload_files with', files.length, 'files');
	const x = await upload_files(files, platform);
	console.log('Edit server: Upload returned', x.length, 'URLs:', x);
	const new_x = x.length > 0 ? [...kept_x, ...x] : kept_x;

	const payload = {
		...item,
		t: t || item.t,
		a,
		k,
		v,
		p,
		m,
		x: new_x,
		z: data.get('z') ? JSON.parse(data.get('z') as string) : item.z || []
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

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	const { i } = params;
	if (!i) return error(400, 'Missing item id');

	const item = await get<Item>(i);
	if (!item || item.s !== 'i' || locals.user.i !== item.u) {
		return error(403, 'Unauthorized');
	}

	const qdrant = (await import('$lib/db')).qdrant;
	await qdrant.delete(collection, {
		points: [i]
	});

	throw redirect(303, '/find');
};