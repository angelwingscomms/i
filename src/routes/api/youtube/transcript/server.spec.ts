import { describe, it, expect } from 'vitest';
import { parseTimedTextToPlainText } from './+server';

describe('parseTimedTextToPlainText', () => {
	it('strips tags and decodes entities', () => {
		const xml =
			'<transcript><text start="0" dur="1">Hello &amp; welcome</text><text>to &lt;YT&gt;</text></transcript>';
		const t = parseTimedTextToPlainText(xml);
		expect(t).toBe('Hello & welcome\nto <YT>');
	});
});
