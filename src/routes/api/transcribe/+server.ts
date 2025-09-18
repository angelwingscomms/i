import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GEMINI } from '$env/static/private';
import axios from 'axios';

export const POST: RequestHandler = async ({
	request,
}) => {
	try {
		const formData = await request.formData();
		const audioFile = formData.get('audio') as File;

		if (!audioFile) {
			return json(
				{ error: 'No audio file provided' },
				{ status: 400 }
			);
		}

		// Convert audio file to base64
		const arrayBuffer = await audioFile.arrayBuffer();
		const base64Audio =
			Buffer.from(arrayBuffer).toString('base64');

		// Get the mime type
		const mimeType = audioFile.type || 'audio/webm';

		// Call Gemini API for speech-to-text
		const response = await axios.post(
			'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
			{
				contents: [
					{
						parts: [
							{
								text: 'Please transcribe this audio file to text. Only return the transcribed text, no additional commentary.'
							},
							{
								inline_data: {
									mime_type: mimeType,
									data: base64Audio
								}
							}
						]
					}
				]
			},
			{
				headers: {
					'Content-Type': 'application/json'
				},
				params: {
					key: GEMINI
				}
			}
		);

		const transcribedText =
			response.data.candidates?.[0]?.content
				?.parts?.[0]?.text;

		if (!transcribedText) {
			return json(
				{ error: 'Failed to transcribe audio' },
				{ status: 500 }
			);
		}

		return json({
			text: transcribedText.trim()
		});
	} catch (error) {
		console.error('Transcription error:', error);

		if (axios.isAxiosError(error)) {
			return json(
				{
					error: 'Failed to transcribe audio',
					details:
						error.response?.data?.error?.message ||
						error.message
				},
				{ status: 500 }
			);
		}

		return json(
			{
				error: 'Transcription failed',
				details:
					error instanceof Error
						? error.message
						: 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
