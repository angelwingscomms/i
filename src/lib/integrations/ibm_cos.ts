// Minimal stub for IBM COS uploads; replace with real SDK wiring
export async function upload_image(_file: File): Promise<string> {
	// In tests/dev, just return a data URL placeholder or echo name
	return Promise.resolve(`data:image/png;base64,`);
}

