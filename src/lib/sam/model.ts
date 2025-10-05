import * as ort from 'onnxruntime-web';
import type {
	ModelDataProps,
	ModelInputProps,
	ModelScaleProps
} from '$lib/types/sam';

export function model_data({
	clicks,
	tensor,
	model_scale
}: ModelDataProps) {
	const image_embedding = tensor as ort.Tensor;
	let point_coords: Float32Array;
	let point_labels: Float32Array;
	let point_coords_tensor: ort.Tensor | undefined;
	let point_labels_tensor: ort.Tensor | undefined;

	if (clicks) {
		const n = clicks.length;
		point_coords = new Float32Array(2 * (n + 1));
		point_labels = new Float32Array(n + 1);

		for (let i = 0; i < n; i++) {
			point_coords[2 * i] =
				clicks[i].x * model_scale.sam_scale;
			point_coords[2 * i + 1] =
				clicks[i].y * model_scale.sam_scale;
			point_labels[i] = clicks[i].click_type;
		}

		point_coords[2 * n] = 0.0;
		point_coords[2 * n + 1] = 0.0;
		point_labels[n] = -1.0;

		point_coords_tensor = new ort.Tensor(
			'float32',
			point_coords,
			[1, n + 1, 2]
		);
		point_labels_tensor = new ort.Tensor(
			'float32',
			point_labels,
			[1, n + 1]
		);
	}

	const image_size_tensor = new ort.Tensor(
		'float32',
		[model_scale.height, model_scale.width]
	);

	if (
		typeof point_coords_tensor === 'undefined' ||
		typeof point_labels_tensor === 'undefined'
	) {
		return;
	}

	const mask_input = new ort.Tensor(
		'float32',
		new Float32Array(256 * 256),
		[1, 1, 256, 256]
	);
	const has_mask_input = new ort.Tensor('float32', [
		0
	]);

	return {
		image_embeddings: image_embedding,
		point_coords: point_coords_tensor,
		point_labels: point_labels_tensor,
		orig_im_size: image_size_tensor,
		mask_input,
		has_mask_input
	};
}
