export function match_percent(
	score?: number
): number | null {
	if (
		typeof score !== 'number' ||
		Number.isNaN(score)
	)
		return null;
	const pct = Math.max(0, Math.min(1, score)) * 100;
	return Math.round(pct);
}
