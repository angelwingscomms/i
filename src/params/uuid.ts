export function match(param: string) {
	// UUID v7 (or general v4/v7-ish) relaxed matcher: 36-char with hyphens
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param);
}

