import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GROQ } from '$env/static/private';
import axios from 'axios';

export const POST: RequestHandler = async ({
	request
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

		// Call Groq Whisper API for speech-to-text
		const formDataForGroq = new FormData();
		formDataForGroq.append('file', audioFile);
		formDataForGroq.append(
			'model',
			'whisper-large-v3-turbo'
		);
		formDataForGroq.append('response_format', 'json');

		const response = await axios.post(
			'https://api.groq.com/openai/v1/audio/transcriptions',
			formDataForGroq,
			{
				headers: {
					Authorization: `Bearer ${GROQ}`,
					'Content-Type': 'multipart/form-data'
				}
			}
		);

		const transcribedText = response.data.text;

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
