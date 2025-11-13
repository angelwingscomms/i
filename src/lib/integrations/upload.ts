import { dev } from '$app/environment';
import {
	CLOUDFLARE_KEY,
	CLOUDFLARE_KEY_ID
} from '$env/static/private';
import {
	S3Client,
	PutObjectCommand
} from '@aws-sdk/client-s3';

type Platform = App.Platform | undefined;

function infer_extension(mime: string) {
	const map: Record<string, string> = {
		'audio/mpeg': 'mp3',
		'audio/mp3': 'mp3',
		'audio/wav': 'wav',
		'audio/ogg': 'ogg',
		'audio/aac': 'aac',
		'audio/flac': 'flac',
		'video/mp4': 'mp4',
		'video/webm': 'webm'
	};
	return map[mime] ?? 'bin';
}

export async function upload_file(
	file: File,
	{
		key,
		platform
	}: {
		key?: string;
		platform?: Platform;
	}
) {
	const ext = key
		? key.split('.').pop() || 'bin'
		: infer_extension(file.type);
	const objectKey =
		key ??
		`uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

	const uint8 = new Uint8Array(
		await file.arrayBuffer()
	);

	if (dev) {
		const { env } = await import(
			'$env/dynamic/private'
		);
		const client = new S3Client({
			region: 'auto',
			endpoint: `https://${env.R2_S3}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: CLOUDFLARE_KEY_ID,
				secretAccessKey: CLOUDFLARE_KEY
			}
		});
		await client.send(
			new PutObjectCommand({
				Bucket: 'iri',
				Key: objectKey,
				Body: uint8,
				ContentType:
					file.type || 'application/octet-stream'
			})
		);
		return `https://pub-094030d6a86b4bf2b41abb6daf297c6d.r2.dev/${objectKey}`;
	}

	const bucket = platform?.env?.R2;
	if (!bucket)
		throw new Error('R2 bucket not available');
	await bucket.put(objectKey, uint8, {
		httpMetadata: {
			contentType:
				file.type || 'application/octet-stream'
		}
	});
	return `https://files.apexlinks.org/${objectKey}`;
}
