import COS from 'ibm-cos-sdk';
import { env } from '$env/dynamic/private';

let cos: COS.S3 | null = null;

function get_client() {
	if (cos) return cos;
	const endpoint = env.IBM_COS_ENDPOINT;
	const apiKeyId = env.IBM_COS_API_KEY_ID;
	const serviceInstanceId = env.IBM_COS_INSTANCE_ID;
	if (!endpoint || !apiKeyId || !serviceInstanceId) throw new Error('IBM COS env not set');
	cos = new COS.S3({
		endpoint,
		apiKeyId,
		ibmAuthEndpoint: 'https://iam.cloud.ibm.com/identity/token',
		serviceInstanceId,
		signatureVersion: 'iam'
	} as any);
	return cos;
}

export async function upload_image(file: File, key?: string): Promise<string> {
	const bucket = env.IBM_COS_BUCKET;
	const endpoint = env.IBM_COS_ENDPOINT;
	if (!bucket || !endpoint) throw new Error('IBM COS bucket/endpoint missing');
	const s3 = get_client();
	const arrayBuffer = await file.arrayBuffer();
	const Body = Buffer.from(arrayBuffer);
	const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
	const objectKey = key || `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
	await s3
		.upload({ Bucket: bucket, Key: objectKey, Body, ContentType: file.type || 'application/octet-stream' })
		.promise();
	return `https://${endpoint}/${bucket}/${objectKey}`;
}

