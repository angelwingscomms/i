function array_to_image_data(
	input: Float32Array,
	width: number,
	height: number
): ImageData {
	// Dummy implementation
	const data = new Uint8ClampedArray(
		width * height * 4
	);
	for (let i = 0; i < input.length; i++) {
		const val = Math.floor(input[i] * 255);
		data[i * 4] = val;
		data[i * 4 + 1] = val;
		data[i * 4 + 2] = val;
		data[i * 4 + 3] = 255;
	}
	return new ImageData(data, width, height);
}

function image_data_to_canvas(
	image_data: ImageData
): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = image_data.width;
	canvas.height = image_data.height;
	const ctx = canvas.getContext('2d');
	if (ctx) {
		ctx.putImageData(image_data, 0, 0);
	}
	return canvas;
}

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
