import { describe, expect, it } from 'vitest';
import { addToast, removeToast, toasts } from '$lib/util/toast.svelte';

describe('toast module', () => {
	it('adds toast without reassigning export', () => {
		const count = toasts.length;
		addToast('sample', 'info', 1000);
		expect(toasts.length).toBe(count + 1);
		expect(toasts.at(-1)?.message).toBe('sample');
	});

	it('removes toast by id', () => {
		addToast('removable', 'success', 5000);
		const last = toasts.at(-1);
		expect(last?.id).toBeDefined();
		if (!last) return;
		removeToast(last.id);
		expect(toasts.find((toast) => toast.id === last.id)).toBeUndefined();
	});
});
