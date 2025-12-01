export const cosine_similarity = (
	a: number[],
	b: number[]
): number => {
	if (a.length !== b.length) {
		throw new Error(
			'vectors must be the same length'
		);
	}

	let dot_product = 0;
	let norm_a = 0;
	let norm_b = 0;

	for (let i = 0; i < a.length; i++) {
		dot_product += a[i] * b[i];
		norm_a += a[i] * a[i];
		norm_b += b[i] * b[i];
	}

	if (norm_a === 0 || norm_b === 0) {
		return 0;
	}

	return (
		dot_product /
		(Math.sqrt(norm_a) * Math.sqrt(norm_b))
	);
};
