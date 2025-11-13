import {
	beforeEach,
	describe,
	expect,
	it,
	vi
} from 'vitest';
import {
	addToast,
	removeToast,
	toasts,
	clearToasts
} from '$lib/util/toast.svelte';

vi.useFakeTimers();

describe('toast module', () => {
	beforeEach(() => {
		clearToasts();
		vi.clearAllTimers();
	});

	it('adds toast without reassigning export', () => {
		addToast('sample', 'info', 1000);

		expect(toasts.at(-1)?.message).toBe('sample');
	});

	it('removes toast by id and via timeout', () => {
		addToast('removable', 'success', 5000);
		const last = toasts.at(-1);
		expect(last?.id).toBeDefined();
		if (!last) return;
		removeToast(last.id);
		expect(
			toasts.find((toast) => toast.id === last.id)
		).toBeUndefined();

		addToast('auto', 'warning', 3000);
		vi.runAllTimers();
		expect(
			toasts.find((toast) => toast.message === 'auto')
		).toBeUndefined();
	});
});
