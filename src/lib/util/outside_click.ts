import type { Action } from 'svelte/action';

export const outside_click =
	(callback: () => void): Action =>
	(node) => {
		document.addEventListener(
			'click',
			(event) => {
				if (
					node &&
					!node.contains(event.target as Node) &&
					!event.defaultPrevented
				)
					callback();
			},
			true
		);
	};
