import type { Item } from '$lib/types/item';

export const item_schema_prompt = `you are given item details. return json matching this schema:
{
  "n": string; // name/title
  "a"?: string; // about/description
  "p"?: number; // price
  "c"?: string; // currency symbol
  "k"?: 0 | 1; // kind, 0 product, 1 service
  "m"?: string; // currency code
  "z"?: { "i": string; "n": string }[]; // zones, keep i when known else empty string
  "q"?: string; // summary
  "x"?: string[]; // image urls if present in source
  "t"?: string[]; // tags or keywords detected
}`;

export const item_fields = [
	'n',
	'a',
	'p',
	'c',
	'k',
	'm',
	'z',
	'q',
	'x',
	't'
] as const satisfies readonly (keyof Item | 't')[];

export const default_item: Pick<Item, 'n' | 'c' | 'k'> = {
	n: '',
	c: '₦',
	k: 0
};
