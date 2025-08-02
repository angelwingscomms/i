import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
	timeout?: NodeJS.Timeout;
}

const TOAST_TIMEOUT_MS = 3000;

const { subscribe, update } = writable<Toast[]>([]);
let nextId = 0;

function send(message: string, type: ToastType = 'info', timeoutMs: number = TOAST_TIMEOUT_MS) {
	const id = nextId++;
	let timeout: NodeJS.Timeout | undefined;

	if (timeoutMs > 0) {
		timeout = setTimeout(() => {
			remove(id);
		}, timeoutMs);
	}

	update((toasts) => {
		// Clear any existing timeout if a toast with the same ID is somehow being updated
		const existingToast = toasts.find((t) => t.id === id);
		if (existingToast && existingToast.timeout) {
			clearTimeout(existingToast.timeout);
		}
		return [...toasts, { id, message, type, timeout }];
	});
}

function remove(id: number) {
	update((toasts) => {
		const toastToRemove = toasts.find((t) => t.id === id);
		if (toastToRemove && toastToRemove.timeout) {
			clearTimeout(toastToRemove.timeout);
		}
		return toasts.filter((t) => t.id !== id);
	});
}

export const toasts = {
	subscribe,
	send,
	remove,
	success: (message: string, timeoutMs?: number) => send(message, 'success', timeoutMs),
	error: (message: string, timeoutMs?: number) => send(message, 'error', timeoutMs),
	info: (message: string, timeoutMs?: number) => send(message, 'info', timeoutMs),
	warning: (message: string, timeoutMs?: number) => send(message, 'warning', timeoutMs)
};
