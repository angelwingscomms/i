import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import axios from 'axios';

interface Body {
	id: string;
}

function parseTimedTextToPlainText(
	xml: string
): string {
	// Very lightweight parse: strip tags and decode basic entities
	// This avoids bringing in an XML parser dependency.
	const lines = xml
		.split(/<text[^>]*>(.*?)<\/text>/g)
		.filter((_, i) => i % 2 === 1) // capture groups content
		.map((t) => {
			const decoded = t
				.replace(/&amp;/g, '&')
				.replace(/&#39;/g, "'")
				.replace(/&quot;/g, '"')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>');
			// Strip known timedtext tags but preserve literal <...> content
			return decoded
				.replace(/<\/?font[^>]*>/g, '')
				.replace(/<br\s*\/?>(\r?\n)?/g, '\n')
				.trim();
		})
		.filter(Boolean);
	return lines.join('\n');
}

export const POST: RequestHandler = async ({
	request
}) => {
	const { id } = (await request.json()) as Body;
	if (!id) throw error(400, 'id required');

	const captionEndpoints = [
		`https://video.google.com/timedtext?lang=en&v=${id}`,
		`https://video.google.com/timedtext?lang=en-US&v=${id}`,
		`https://video.google.com/timedtext?lang=en&kind=asr&v=${id}`, // auto captions
		`https://video.google.com/timedtext?lang=en-US&kind=asr&v=${id}`
	];

	for (const url of captionEndpoints) {
		try {
			const res = await axios.get(url, {
				responseType: 'text'
			});
			const xml = res.data as string;
			if (xml && xml.includes('<text')) {
				return json({
					t: parseTimedTextToPlainText(xml)
				});
			}
		} catch {
			// try next
		}
	}

	return json({ t: '' });
};

export const _parseTimedTextToPlainText =
	parseTimedTextToPlainText;
