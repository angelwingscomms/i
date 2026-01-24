import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { qdrant, find_user_by_email } from '$lib/db';
import type { User } from '$lib/types';
import { collection } from '$lib/constants';
import { embed } from '$lib/util/embed';
import { create_zone_by_place_id } from '$lib/util/zones';
import {
	sanitize_email_list,
	sanitize_phone_list
} from '$lib/util/users/contact';

export const POST: RequestHandler = async ({
	request,
	locals
}) => {
	// console.log('eu--')
	if (!locals.user) {
		return json(
			{ error: 'Unauthorized' },
			{ status: 401 }
		);
	}

	try {
		const {
			tag,
			description,
			age,
			gender,
			latitude,
			longitude,
			whatsapp,
			telegram,
			socialLinks,
			avatarDataUrl,
			email,
			b,
			k,
			m,
			y,
			o,
			ke,
			z
		} = await request.json();

		const updatedUser: Partial<User> = {};

		if (
			tag !== undefined &&
			typeof tag === 'string' &&
			tag.trim().length > 0
		) {
			updatedUser.t = tag.trim();
		}

		if (
			m !== undefined &&
			typeof m === 'string' &&
			m.trim().length > 0
		) {
			updatedUser.m = m.trim().slice(0, 96);
		}

		if (
			description !== undefined &&
			typeof description === 'string' &&
			description.trim().length > 0
		) {
			updatedUser.d = description.trim();
		}

		if (
			age !== undefined &&
			typeof age === 'number' &&
			!isNaN(age) &&
			age >= 18 &&
			age <= 120
		) {
			updatedUser.a = age;
		}

		if (
			gender !== undefined &&
			typeof gender === 'number' &&
			!isNaN(gender) &&
			(gender === 0 || gender === 1)
		) {
			updatedUser.g = gender;
		}

		if (
			latitude !== undefined &&
			typeof latitude === 'number' &&
			!isNaN(latitude)
		) {
			updatedUser.l = latitude;
		}

		if (
			longitude !== undefined &&
			typeof longitude === 'number' &&
			!isNaN(longitude)
		) {
			updatedUser.n = longitude;
		}

		if (
			whatsapp !== undefined &&
			typeof whatsapp === 'string'
		) {
			updatedUser.w = whatsapp.trim();
		}

		if (typeof y === 'boolean') {
			updatedUser.y = y;
		}

		if (typeof o === 'boolean') {
			updatedUser.o = o;
		}

		if (typeof ke === 'boolean') {
			updatedUser.ke = ke;
		}

		if (
			z !== undefined &&
			Array.isArray(z) &&
			z.every((value) => typeof value === 'string')
		) {
			const filtered_z = z
				.map((value: string) => value.trim())
				.filter((value: string) => value.length > 0);
			const unique_z = Array.from(
				new Set(filtered_z)
			);
			for (const place_id of unique_z) {
				await create_zone_by_place_id(
					place_id,
					locals.user.i
				);
			}
			updatedUser.z = unique_z;
		}

		if (
			socialLinks !== undefined &&
			Array.isArray(socialLinks) &&
			socialLinks.every(
				(link) => typeof link === 'string'
			)
		) {
			let filtered = socialLinks
				.filter((link: string) => link.trim() !== '')
				.map((link: string) => link.trim());
			
			// Handle dedicated whatsapp and telegram fields
			if (
				typeof whatsapp === 'string' &&
				whatsapp.trim()
			) {
				updatedUser.wh = whatsapp.trim();
				// Remove any existing whatsapp links from socialLinks
				filtered = filtered.filter(
					(link: string) =>
						!link.includes('whatsapp.com') &&
						!link.includes('wa.me')
				);
			} else {
				updatedUser.wh = undefined;
			}

			if (
				typeof telegram === 'string' &&
				telegram.trim()
			) {
				updatedUser.tg = telegram.trim();
				// Remove any existing telegram links from socialLinks
				filtered = filtered.filter(
					(link: string) =>
						!link.includes('telegram.org') &&
						!link.includes('t.me')
				);
			} else {
				updatedUser.tg = undefined;
			}

			updatedUser.x = filtered;
		}

		if (
			Array.isArray(b) &&
			b.every((value) => typeof value === 'string')
		) {
			const phones = sanitize_phone_list(b);
			updatedUser.b = phones.length ? phones : [];
		}

		if (
			Array.isArray(k) &&
			k.every((value) => typeof value === 'string')
		) {
			const emails = sanitize_email_list(k);
			updatedUser.k = emails.length ? emails : [];
		}

		if (
			typeof avatarDataUrl === 'string' &&
			avatarDataUrl.trim().length > 0
		) {
			const val = avatarDataUrl.trim();
			if (val.startsWith('data:image/')) {
				const approxBytes = Math.ceil(
					(val.length * 3) / 4
				);
				if (approxBytes <= 200_000) {
					updatedUser.av = val;
				}
			} else if (/^https?:\/\//.test(val)) {
				updatedUser.av = val;
			}
		}

		if (
			email !== undefined &&
			typeof email === 'string'
		) {
			const normalized = email.trim().toLowerCase();
			if (
				normalized.length > 3 &&
				normalized.length <= 320 &&
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
			) {
				const existing =
					await find_user_by_email(normalized);
				if (
					existing &&
					existing.i !== locals.user.i
				) {
					return json(
						{ error: 'email taken' },
						{ status: 400 }
					);
				}
				updatedUser.e = normalized;
			}
		}

		if (Object.keys(updatedUser).length === 0) {
			return json(
				{
					error: 'No valid fields provided for update'
				},
				{ status: 400 }
			);
		}

		if (!locals.user.i) {
			console.error(
				`!locals.user.i -edit_user server route`
			);
			return error(500);
		}

		console.log('updated_user', updatedUser);

		await qdrant.setPayload('i', {
			wait: true,
			payload: updatedUser, // example: updating a username
			points: [locals.user.i]
		});

		let vector;
		if (updatedUser.d) {
			// Only embed if description is provided
			vector = await embed(updatedUser.d as string);

			if (!vector) {
				console.error(
					'error creating embedding for user',
					locals.user,
					updatedUser
				);
				return error(500, 'error creating embedding');
			}

			await qdrant.updateVectors(collection, {
				points: [
					{
						id: locals.user.i,
						vector
					}
				]
			});
		}

		return json({
			success: true,
			message: 'Profile updated successfully'
		});
	} catch (err) {
		return json(
			{ error: 'Failed to update profile' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({
	locals
}) => {
	if (!locals.user || !locals.user.i) {
		error(401, 'Unauthorized');
	}
	await qdrant.delete('i', {points: [locals.user.i]});
	return new Response()
}