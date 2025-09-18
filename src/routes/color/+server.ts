import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { edit_point } from '$lib/db';
import {
	get_user_colors,
	generateColorPalette
} from '$lib/util/colors';

export const GET: RequestHandler = async ({
	locals
}) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	const user_i = locals.user.i;
	const colors = await get_user_colors(user_i);
	return json(colors);
};

export const POST: RequestHandler = async ({
	request,
	locals
}) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	const user_i = locals.user.i;
	const data = await request.json();
	const { d } = data;
	if (!d?.trim()) {
		throw error(400, 'Description required');
	}
	try {
		const colors = await generateColorPalette(
			user_i,
			d
		);
		await edit_point(user_i, { c: colors });
		return json({ c: colors });
	} catch (e: unknown) {
		const message =
			e instanceof Error
				? e.message
				: 'Failed to generate colors';
		throw error(400, message);
	}
};

export const PUT: RequestHandler = async ({
	request,
	locals
}) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	const user_i = locals.user.i;
	const data = await request.json();
	const { c } = data;
	if (
		!Array.isArray(c) ||
		c.length === 0 ||
		c.length > 20
	) {
		throw error(
			400,
			'Must provide an array of 1-20 colors'
		);
	}
	const hexRegex = /^([0-9a-fA-F]{6})$/;
	for (const color of c) {
		if (
			typeof color !== 'string' ||
			!hexRegex.test(color)
		) {
			throw error(
				400,
				'Each color must be a valid 6-digit hex code without #'
			);
		}
	}
	const normalizedColors = c.map((col) =>
		col.toLowerCase()
	);
	await edit_point(user_i, { c: normalizedColors });
	return json({ success: true, c: normalizedColors });
};
