import { describe, expect, it } from 'vitest';
import { addToast, removeToast, toasts } from '$lib/util/toast.svelte';

describe('toast utilities', () => {
	it('adds toast entries without reassigning state', () => {
		const count_before = toasts.length;

		addToast('hello world', 'info', 1000);

		expect(toasts.length).toBe(count_before + 1);
		expect(toasts.at(-1)?.message).toBe('hello world');
	});

	it('removes toast by id', () => {
		addToast('removable toast', 'success', 3000);
		const current = toasts.at(-1);
		expect(current?.id).toBeDefined();

		if (!current) return;

		removeToast(current.id);
		expect(toasts.find((toast) => toast.id === current.id)).toBeUndefined();
	});
});
