import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { get, edit_point } from '$lib/db';
import type { SyncProject } from '$lib/types';
import { upload_file } from '$lib/integrations/upload';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const POST: RequestHandler = async ({
	request,
	locals,
	params,
	platform
}) => {
	const user = locals.user;
	if (!user) throw error(401, 'login required');

	const { i } = params;
	if (!i) throw error(400, 'missing sync id');

	const project = await get<SyncProject>(i, [
		's',
		'u',
		'd',
		't',
		'n',
		'g'
	]);
	if (!project || project.s !== 'sync') {
		throw error(404, 'sync project not found');
	}

	if (project.u !== user.i) {
		throw error(403, 'not authorized');
	}

	const form = await request.formData();
	const file = form.get('file');
	const duration = Number(form.get('duration') ?? 0);

	if (!(file instanceof File)) {
		throw error(400, 'audio file required');
	}

	if (!file.type.startsWith('audio/')) {
		throw error(400, 'invalid audio type');
	}

	if (file.size > MAX_FILE_SIZE) {
		throw error(400, 'audio file too large');
	}

	const url = await upload_file(file, { platform });

	const m = {
		u: url,
		k: file.type,
		d:
			Number.isFinite(duration) && duration > 0
				? duration
				: undefined
	};

	await edit_point(i, {
		s: 'sync',
		u: project.u,
		d: project.d ?? Date.now(),
		t: project.t,
		n: project.n,
		m,
		g: project.g
	});

	return json({ m });
};
