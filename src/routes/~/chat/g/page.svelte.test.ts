import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

const load = vi.fn();
const generate = vi.fn();
const reset = vi.fn();

vi.mock('$lib/util/granite/client', () => ({
	supports_webgpu: vi.fn(() => false),
	create_granite_client: () => ({ load, generate, reset })
}));

describe('/~/chat/g', () => {
	it('shows webgpu requirement notice when unsupported', async () => {
		render(Page);
		const notice = page.getByText('webgpu support required');
		await expect.element(notice).toBeInTheDocument();
	});
});
