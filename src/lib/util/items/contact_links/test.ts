import { describe, expect, it } from 'vitest';

import { get_contact_links } from './index';

describe('get_contact_links', () => {
	it('returns whatsapp link when number provided', () => {
		const result = get_contact_links({
			w: '+1 (234) 567-8900'
		});
		expect(result.whatsapp).toEqual('12345678900');
	});

	it('returns discord link when one exists', () => {
		const result = get_contact_links({
			x: ['https://discord.gg/example']
		});
		expect(result.discord).toEqual(
			'https://discord.gg/example'
		);
	});

	it('prefers primary discord link when multiple present', () => {
		const result = get_contact_links({
			x: [
				'https://twitter.com/test',
				'https://discord.com/invite/hello'
			]
		});
		expect(result.discord).toEqual(
			'https://discord.com/invite/hello'
		);
	});

	it('returns undefined when no contact info available', () => {
		const result = get_contact_links({});
		expect(result).toEqual({});
	});
});
