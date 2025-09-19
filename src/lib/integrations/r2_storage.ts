import { dev } from '$app/environment';

// Platform interface for Cloudflare Workers
export interface Platform {
	env: {
		R2: R2Bucket;
		[key: string]: unknown;
	};
}

interface R2Bucket {
	put(
		key: string,
		value: Uint8Array,
		metadata?: {
			httpMetadata?: { contentType?: string };
		}
	): Promise<void>;
	delete(key: string): Promise<void>;
	head(key: string): Promise<R2Object | null>;
}

interface R2Object {
	size: number;
	httpMetadata?: { contentType?: string };
}

export async function upload_image(
	file: File,
	key?: string,
	platform?: Platform
): Promise<string> {
	// Get R2 bucket from platform or environment
	const bucket = platform?.env?.R2;
	if (!bucket) {
		throw new Error('R2 bucket not available');
	}

	// Generate unique key for the file
	const ext = (
		file.name.split('.').pop() || 'bin'
	).toLowerCase();
	const objectKey =
		key ||
		`uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

	try {
		// Convert file to Uint8Array for R2
		const arrayBuffer = await file.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);

		// Upload to R2
		await bucket.put(objectKey, uint8Array, {
			httpMetadata: {
				contentType:
					file.type || 'application/octet-stream'
			}
		});

		return dev
			? `https://pub-094030d6a86b4bf2b41abb6daf297c6d.r2.dev/${objectKey}`
			: `https://files.apexlinks.org/${objectKey}`;
	} catch (error) {
		console.error('R2 upload error:', error);
		throw new Error(
			`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

// Helper function to delete a file from R2
export async function delete_image(
	key: string,
	platform?: Platform
): Promise<void> {
	const bucket = platform?.env?.R2;
	if (!bucket) {
		throw new Error('R2 bucket not available');
	}

	try {
		await bucket.delete(key);
	} catch (error) {
		console.error('R2 delete error:', error);
		throw new Error(
			`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

// Helper function to get file info from R2
export async function get_image_info(
	key: string,
	platform?: Platform
): Promise<R2Object | null> {
	const bucket = platform?.env?.R2;
	if (!bucket) {
		throw new Error('R2 bucket not available');
	}

	try {
		const object = await bucket.head(key);
		return object;
	} catch (error) {
		console.error('R2 get info error:', error);
		return null;
	}
}
