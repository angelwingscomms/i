import type { ModelScaleProps } from '$lib/types/sam';

const LONG_SIDE_LENGTH = 1024;

export function handle_image_scale(
	image: HTMLImageElement
): ModelScaleProps {
	const w = image.naturalWidth;
	const h = image.naturalHeight;
	const sam_scale = LONG_SIDE_LENGTH / Math.max(h, w);
	return { sam_scale, height: h, width: w };
}
