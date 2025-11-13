import { GEMINI, GROQ } from '$env/static/private';
import { google } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import {
	generateObject,
	streamText,
	type JsonSchema
} from 'ai';
import { item_schema_prompt } from './schema';

const google_provider = GEMINI
	? google({ apiKey: GEMINI })
	: null;

const groq_provider = GROQ
	? createGroq({ apiKey: GROQ })
	: null;

export const item_schema: JsonSchema = {
	type: 'object',
	required: ['n'],
	properties: {
		n: { type: 'string' },
		a: { type: 'string' },
		p: { type: 'number' },
		c: { type: 'string' },
		k: { type: 'integer', enum: [0, 1] },
		m: { type: 'string' },
		q: { type: 'string' },
		t: {
			type: 'array',
			items: { type: 'string' }
		},
		x: {
			type: 'array',
			items: { type: 'string' }
		},
		z: {
			type: 'array',
			items: {
				type: 'object',
				required: ['n'],
				properties: {
					i: { type: 'string' },
					n: { type: 'string' }
				}
			}
		}
	}
};

export type ItemExtraction = {
	n: string;
	a?: string;
	p?: number;
	c?: string;
	k?: 0 | 1;
	m?: string;
	q?: string;
	t?: string[];
	x?: string[];
	z?: {
		i?: string;
		n: string;
	}[];
};

const ensure_google = () => {
	if (!google_provider)
		throw new Error('missing gemini api key');
	return google_provider;
};

const ensure_groq = () => {
	if (!groq_provider)
		throw new Error('missing groq api key');
	return groq_provider;
};

export const extract_item_from_text = async (
	text: string,
	ctx: string
): Promise<ItemExtraction> => {
	const provider = ensure_google();
	const { object } = await generateObject({
		model: provider('gemini-2.0-flash-exp'),
		schema: item_schema,
		prompt: `${item_schema_prompt}
context: ${ctx}
	text: ${text}`
	});
	return object as ItemExtraction;
};

export const extract_item_from_image = async (
	file: File,
	ctx: string
): Promise<ItemExtraction> => {
	const provider = ensure_google();
	const { object } = await generateObject({
		model: provider('gemini-flash-latest'),
		messages: [
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: `${item_schema_prompt}
context: ${ctx}`
					},
					{
						type: 'file',
						data: await file.arrayBuffer(),
						mediaType: file.type
					}
				]
			}
		],
		schema: item_schema
	});
	return object as ItemExtraction;
};

export const transcribe_audio = async (
	audio: File
): Promise<string> => {
	const provider = ensure_groq();
	const { text } = await streamText({
		model: provider.audioTranscription(
			'whisper-large-v3-turbo'
		),
		audio
	});
	return text.trim();
};
