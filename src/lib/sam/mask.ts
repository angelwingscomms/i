export function onnx_mask_to_image(
	input: Float32Array,
	width: number,
	height: number
): HTMLImageElement {
	const image_data = array_to_image_data(
		input,
		width,
		height
	);
	const canvas = image_data_to_canvas(image_data);
	const image = new Image();
	image.src = canvas.toDataURL();
	return image;
}

// function array_to_image_data(input: Float32Array, width: number, height: number): ImageData {
//   const [r,
