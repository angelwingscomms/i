export interface DiaryEntry {
	s: 'diary';
	u: string;
	d: number; // timestamp (ms)
	a: string;
	i?: string;
	e?: string; // embedding marker / hash
}
