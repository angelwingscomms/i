import { error, redirect } from '@sveltejs/kit';
import { edit_point } from '$lib/db';
import type { RequestHandler } from './$types';
import { get } from '$lib/db';
import type { Item } from '$lib/types/item';
import type { Zone } from '$lib/types/zone';
import { embed } from '$lib/util/embed';
import { collection } from '$lib/constants';
import { upload_image } from '$lib/integrations/r2_storage';

async function upload_files(
	files: File[],
	platform: any
): Promise<string[]> {
	if (!files || files.length === 0) return [];
	if (!platform?.env?.R2) {
		console.warn(
			'R2 bucket not available, skipping upload'
		);
		return [];
	}

	const urls: string[] = [];
	for (const file of files) {
		try {
			console.log(
				'Edit server: Attempting upload for file:',
				file.name,
				file.size
			);
			const url = await upload_image(
				file,
				undefined,
				platform
			);
			console.log(
				'Edit server: Upload success for',
				file.name,
				'URL:',
				url
			);
			urls.push(url);
		} catch (e) {
			console.error(
				'R2 upload error for',
				file.name,
				':',
				e
			);
		}
	}
	return urls;
}

export const POST: RequestHandler = async ({
	params,
	locals,
	request,
	platform
}) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	const { i } = params;
	if (!i) return error(400, 'Missing item id');

	const item = await get<Item>(i);
	if (
		!item ||
		item.s !== 'i' ||
		locals.user.i !== item.u
	) {
		return error(403, 'Unauthorized');
	}

	const data = await request.formData();
	const n = (data.get('n') as string) || item.n;
	const a = data.get('a') as string | null;
	const k_raw = data.get('k');
	const p_raw = data.get('p');
	const c = (data.get('c') as string) || item.c;
	const h = (data.get('h') as string) || item.h || '';
	const price = p_raw ? Number(p_raw) : item.p;
	const kind =
		typeof k_raw === 'string'
			? Number(k_raw)
			: item.k;
	const files = data.getAll('f') as unknown as File[];
	console.log(
		'Edit server: Files received from formData:',
		files.length,
		files.map((f) => f?.name || 'no name')
	);
	if (files.length > 0) {
		files.forEach((f, idx) =>
			console.log(
				`Edit server: File ${idx}: name=${f.name}, size=${f.size}, type=${f.type}`
			)
		);
	} else {
		console.log(
			'Edit server: No files in formData, full entries:',
			Array.from(data.entries()).map(([k, v]) => ({
				k,
				v: v instanceof File ? 'File' : v
			}))
		);
	}
	const keep_x_str = data.get('keep_x') as string;
	const kept_x: string[] = keep_x_str
		? JSON.parse(keep_x_str)
		: item.x || [];

	console.log(
		'Edit server: Calling upload_files with',
		files.length,
		'files'
	);
	const x = await upload_files(files, platform);
	console.log(
		'Edit server: Upload returned',
		x.length,
		'URLs:',
		x
	);
	const new_x =
		x.length > 0 ? [...kept_x, ...x] : kept_x;

	const zones = data.get('z')
		? JSON.parse(data.get('z') as string)
		: item.z || [];

	const payload = {
		...item,
		n,
		a: a ?? item.a,
		k: Number.isNaN(kind) ? item.k : (kind as 0 | 1),
		p: price,
		c,
		h,
		x: new_x,
		z: zones
	};

	const embed_text =
		`${payload.n} ${payload.a || ''} ${
			price ? `price ${price}` : ''
		} ${zones.map((z: Zone) => z.n).join(' ')}`.trim();
	const vector = await embed(embed_text);

	await edit_point(i, payload);

	// Update vector
	const qdrant = (await import('$lib/db')).qdrant;
	await qdrant.updateVectors(collection, {
		points: [{ id: i, vector }]
	});

	throw redirect(303, `/~/items/${i}`);
};
