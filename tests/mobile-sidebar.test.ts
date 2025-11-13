import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import MobileSidebar from '$lib/components/MobileSidebar.svelte';

const page_value = {
	data: {
		user: {
			t: 'tester'
		}
	}
};

vi.mock('$app/state', () => ({
	page: {
		subscribe: (
			fn: (value: typeof page_value) => void
		) => {
			fn(page_value);
			return () => {};
		}
	}
}));

describe('MobileSidebar', () => {
	it('marks navigation as scrollable', () => {
		const { container } = render(MobileSidebar, {
			is_open: true
		});
		const nav = container.querySelector(
			'.sidebar-nav'
		);
		expect(nav).toBeTruthy();
		expect(
			nav?.classList.contains('overflow-y-auto')
		).toBe(true);
		expect(nav?.classList.contains('flex-1')).toBe(
			true
		);
	});
});
