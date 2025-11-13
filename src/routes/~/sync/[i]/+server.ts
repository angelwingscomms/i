import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { get, edit_point } from '$lib/db';
import type { SyncProject } from '$lib/types';
import {
	sanitize_markers,
	markers_to_segments
} from '$lib/util/sync/markers';
import { upload_file } from '$lib/integrations/upload';

const MAX_DURATION = 30 * 60 * 1000;

export const PATCH: RequestHandler = async ({
	request,
	locals,
	params
}) => {
	const user = locals.user;
	if (!user) throw error(401, 'login required');

	const { i } = params;
	if (!i) throw error(400, 'missing sync id');

	const project = await get<SyncProject>(i, [
		's',
		'u',
		'd',
		'n',
		't',
		'm',
		'l',
		'g'
	]);

	if (!project || project.s !== 'sync') {
		throw error(404, 'sync project not found');
	}

	if (project.u !== user.i) {
		throw error(403, 'not authorized');
	}

	const payload = await request.json();

	const markers = sanitize_markers(payload?.t, {
		max_duration: MAX_DURATION
	});

	const name =
		typeof payload?.n === 'string'
			? payload.n.slice(0, 120)
			: project.n;
	const audio = extract_audio(payload?.m);
	const last =
		typeof payload?.l === 'number'
			? payload.l
			: Date.now();

	const updated: SyncProject = {
		s: 'sync',
		u: project.u,
		d: project.d ?? Date.now(),
		t: markers,
		n: name,
		m: audio,
		l: last,
		g: project.g
	};

	await edit_point(i, updated);

	return json({
		ok: true,
		l: updated.l,
		t: updated.t
	});
};

export const POST: RequestHandler = async ({
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
		'n',
		't',
		'm'
	]);

	if (!project || project.s !== 'sync') {
		throw error(404, 'sync project not found');
	}

	if (project.u !== user.i) {
		throw error(403, 'not authorized');
	}

	if (!project.t.length) {
		throw error(400, 'no markers to export');
	}

	const segments = markers_to_segments(project.t, {
		end: infer_duration(project)
	});

	const video_url = await generate_video({
		segments,
		audio: project.m,
		platform
	});

	await edit_point(i, {
		s: 'sync',
		u: project.u,
		d: project.d ?? Date.now(),
		t: project.t,
		n: project.n,
		m: project.m,
		l: Date.now(),
		g: { v: video_url }
	});

	return json({ ok: true, url: video_url });
};

function extract_audio(
	input: unknown
): SyncProject['m'] | undefined {
	if (!input || typeof input !== 'object')
		return undefined;
	const meta = input as Record<string, unknown>;
	const url = meta.u;
	if (typeof url !== 'string' || url.length === 0) {
		return undefined;
	}
	const type =
		typeof meta.k === 'string' ? meta.k : undefined;
	const duration =
		typeof meta.d === 'number' ? meta.d : undefined;
	return { u: url, k: type, d: duration };
}

function infer_duration(
	project: SyncProject
): number | undefined {
	if (project.m?.d && project.m.d > 0)
		return project.m.d;
	const last_marker = project.t[project.t.length - 1];
	return last_marker ? last_marker + 2000 : undefined;
}

async function generate_video({
	segments,
	audio,
	platform
}: {
	segments: ReturnType<typeof markers_to_segments>;
	audio?: SyncProject['m'];
	platform: App.Platform | undefined;
}) {
	const ffmpeg = await import('fluent-ffmpeg');
	const fs = await import('node:fs/promises');
	const path = await import('node:path');
	const os = await import('node:os');

	const tmpDir = await fs.mkdtemp(
		path.join(os.tmpdir(), 'sync-')
	);

	const inputs = segments
		.map(
			(segment) =>
				`color=${segment.color}:s=1920x1080:d=${(segment.end - segment.start) / 1000}`
		)
		.join('|');

	const filters = `concat=n=${segments.length}:v=1:a=0`;

	const command = ffmpeg
		.default()
		.input(`lavfi:${inputs}`)
		.complexFilter(filters)
		.videoCodec('libx264')
		.outputOptions(['-pix_fmt yuv420p']);

	if (audio?.u) {
		command.input(audio.u).audioCodec('aac');
	}

	const outputFile = path.join(tmpDir, 'output.mp4');

	await new Promise<void>((resolve, reject) => {
		command
			.output(outputFile)
			.on('end', () => resolve())
			.on('error', (err: Error) => reject(err))
			.run();
	});

	const fileBuffer = await fs.readFile(outputFile);
	const file = new File(
		[fileBuffer],
		`sync-${Date.now()}.mp4`,
		{
			type: 'video/mp4'
		}
	);

	const url = await upload_file(file, { platform });

	await fs.rm(tmpDir, {
		recursive: true,
		force: true
	});

	return url;
}
