export const outside_click = (
	node: HTMLElement,
	callback?: () => void
) => {
	const handleClick = (event: Event) => {
		if (
			callback &&
			node &&
			!node.contains(event.target as Node) &&
			!event.defaultPrevented
		)
			callback();
	};

	document.addEventListener(
		'click',
		handleClick,
		true
	);

	return {
		destroy() {
			document.removeEventListener(
				'click',
				handleClick,
				true
			);
		}
	};
};
