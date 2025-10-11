import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { GROQ } from '$env/static/private';
import Groq from 'groq-sdk';

export const POST: RequestHandler = async ({
	request
}) => {
	try {
		const formData = await request.formData();
		const audioFile = formData.get('audio') as File;
		const voice =
			(formData.get('voice') as string) ||
			'Fritz-PlayAI';
		const temperature =
			parseFloat(
				formData.get('temperature') as string
			) || 0.7;
		const topP =
			parseFloat(formData.get('topP') as string) ||
			0.8;
		const maxTokens =
			parseInt(formData.get('maxTokens') as string) ||
			200;
		const frequencyPenalty =
			parseFloat(
				formData.get('frequencyPenalty') as string
			) || 0;
		const presencePenalty =
			parseFloat(
				formData.get('presencePenalty') as string
			) || 0;
		200;

		if (!audioFile) {
			throw error(400, 'no audio file provided');
		}

		const groq = new Groq({
			apiKey: GROQ
		});

		// step 1: transcribe audio with groq whisper
		const transcription =
			await groq.audio.transcriptions.create({
				file: audioFile,
				model: 'whisper-large-v3-turbo',
				response_format: 'json'
			});

		const userMessage = transcription.text?.trim();
		if (!userMessage) {
			throw error(500, 'failed to transcribe audio');
		}

		// step 2: generate ai response with llama-3.1-8b-instant
		const chatCompletion =
			await groq.chat.completions.create({
				model: 'llama-3.1-8b-instant',
				messages: [
					{
						role: 'system',
						content:
							'you are a helpful ai assistant. respond naturally and conversationally.'
					},
					{
						role: 'user',
						content: userMessage
					}
				],
				max_tokens: maxTokens,
				temperature: temperature,
				top_p: topP,
				frequency_penalty: frequencyPenalty,
				presence_penalty: presencePenalty
			});

		let aiResponse =
			chatCompletion.choices?.[0]?.message?.content?.trim();
		if (!aiResponse) {
			throw error(
				500,
				'failed to generate ai response'
			);
		}

		// Extract actual response, removing <think> blocks
		const thinkEndIndex =
			aiResponse.lastIndexOf('</think>');
		if (thinkEndIndex !== -1) {
			aiResponse = aiResponse
				.substring(thinkEndIndex + 8)
				.trim();
		}

		// step 3: convert response to speech with playai tts
		const speechResponse =
			await groq.audio.speech.create({
				model: 'playai-tts',
				input: aiResponse,
				voice: voice,
				response_format: 'wav'
			});

		// return the audio response
		return new Response(speechResponse.body, {
			headers: {
				'Content-Type': 'audio/wav'
			}
		});
	} catch (err) {
		console.error('voice chat error:', err);

		if (err instanceof Error) {
			throw error(
				500,
				`voice chat processing failed: ${err.message}`
			);
		}

		throw error(500, 'voice chat processing failed');
	}
};
