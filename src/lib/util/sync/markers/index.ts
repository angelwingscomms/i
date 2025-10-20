export function sanitize_markers(
	markers: number[] | undefined,
	{
		max_duration,
		max_count = 2000,
		precision = 2
	}: {
		max_duration?: number;
		max_count?: number;
		precision?: number;
	} = {}
): number[] {
	if (!Array.isArray(markers) || !markers.length) {
		return [];
	}

	const factor = Math.pow(10, Math.max(0, precision));
	const seen = new Set<number>();
	const cleaned: number[] = [];

	for (const value of markers) {
		if (typeof value !== 'number' || !Number.isFinite(value)) {
			continue;
		}
		const clamped = Math.max(0, value);
		if (typeof max_duration === 'number') {
			if (clamped > max_duration) continue;
		}
		const rounded = Math.round(clamped * factor) / factor;
		if (seen.has(rounded)) continue;
		seen.add(rounded);
		cleaned.push(rounded);
		if (cleaned.length >= max_count) break;
	}

	return cleaned.sort((a, b) => a - b);
}

export function markers_to_segments(
	markers: number[],
	{
		end
	}: { end?: number } = {}
): Array<{ start: number; end: number; color: 'black' | 'white' }> {
	const sanitized = sanitize_markers(markers, {
		max_duration: end
	});
	const segments: Array<{
		start: number;
		end: number;
		color: 'black' | 'white';
	}> = [];
	let previous = 0;
	let index = 0;

	for (const marker of sanitized) {
		if (marker === previous) {
			continue;
		}
		segments.push({
			start: previous,
			end: marker,
			color: index % 2 === 0 ? 'black' : 'white'
		});
		previous = marker;
		index += 1;
	}

	const final_end =
		typeof end === 'number' && end >= previous
			? end
			: previous;

	if (final_end > previous) {
		segments.push({
			start: previous,
			end: final_end,
			color: index % 2 === 0 ? 'black' : 'white'
		});
	}

	return segments;
}
