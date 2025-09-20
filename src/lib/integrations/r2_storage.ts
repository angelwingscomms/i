import { dev } from '$app/environment';
import { CLOUDFLARE_KEY, CLOUDFLARE_KEY_ID } from '$env/static/private';

import { S3Client } from "@aws-sdk/client-s3";

import {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";

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
	// Generate unique key for the file
	const ext = (
		file.name.split('.').pop() || 'bin'
	).toLowerCase();
	const objectKey =
		key ||
		`uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

	try {
		const arrayBuffer = await file.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);

		if (dev) {
			const { env } = await import('$env/dynamic/private');
			const client = new S3Client({
				region: "auto",
				endpoint: `https://${env.R2_S3}.r2.cloudflarestorage.com`,
				credentials: {
					accessKeyId: CLOUDFLARE_KEY_ID,
					secretAccessKey: CLOUDFLARE_KEY
				}
			});

			const command = new PutObjectCommand({
				Bucket: "iri",
				Key: objectKey,
				Body: uint8Array,
				ContentType: file.type || 'application/octet-stream'
			});

			await client.send(command);
		} else {
			const bucket = platform?.env?.R2;
			if (!bucket) {
				throw new Error('R2 bucket not available');
			}

			await bucket.put(objectKey, uint8Array, {
				httpMetadata: {
					contentType: file.type || 'application/octet-stream'
				}
			});
		}

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
	try {
		if (dev) {
			const { env } = await import('$env/dynamic/private');
			const client = new S3Client({
				region: "auto",
				endpoint: `https://${env.R2_S3}.r2.cloudflarestorage.com`,
				credentials: {
					accessKeyId: CLOUDFLARE_KEY_ID,
					secretAccessKey: CLOUDFLARE_KEY
				}
			});

			const command = new DeleteObjectCommand({
				Bucket: "iri",
				Key: key
			});

			await client.send(command);
		} else {
			const bucket = platform?.env?.R2;
			if (!bucket) {
				throw new Error('R2 bucket not available');
			}

			await bucket.delete(key);
		}
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
	 let s3Client: S3Client | null = null;
	 let s3Bucket: string | null = null;
	 let r2Bucket: R2Bucket | null = null;
	 if (dev) {
	   const { env } = await import('$env/dynamic/private');
	   s3Client = new S3Client({
	     region: "auto",
	     endpoint: `https://${env.R2_S3}.r2.cloudflarestorage.com`,
	     credentials: {
	       accessKeyId: CLOUDFLARE_KEY_ID,
	       secretAccessKey: CLOUDFLARE_KEY
	     }
	   });
	   s3Bucket = "iri";
	 } else {
	   r2Bucket = platform?.env?.R2 ?? null;
	   if (!r2Bucket) {
	     throw new Error('R2 bucket not available');
	   }
	 }

	 try {
	   if (dev) {
	     const command = new HeadObjectCommand({
	       Bucket: s3Bucket!,
	       Key: key
	     });
	     const data = await s3Client!.send(command);
	     return {
	       size: data.ContentLength ?? 0,
	       httpMetadata: {
	         contentType: data.ContentType
	       }
	     };
	   } else {
	     const object = await r2Bucket!.head(key);
	     return object;
	   }
	 } catch (error) {
	   console.error('R2 get info error:', error);
	   return null;
	 }
}
