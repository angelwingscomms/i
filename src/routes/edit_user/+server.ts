import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { qdrant, search_by_payload } from '$lib/db';
import type { User } from '$lib/types';
import { collection } from '$lib/constants';
import { embed } from '$lib/util/embed';

export const POST: RequestHandler = async ({ request, locals }) => {
	// console.log('eu--')
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
    const { tag, description, age, gender, latitude, longitude, whatsapp, socialLinks, avatarDataUrl } =
            await request.json();

		const whatsappLink = whatsapp || '';

		// Validate inputs
		if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
			return json({ error: 'Tag is required' }, { status: 400 });
		}

		if (!description || typeof description !== 'string' || description.trim().length === 0) {
			return json({ error: 'Description is required' }, { status: 400 });
		}

		if (isNaN(age) || typeof age !== 'number' || age < 18 || age > 120) {
			return json({ error: 'Age must be between 18 and 120' }, { status: 400 });
		}

		if (isNaN(gender) || typeof gender !== 'number' || (gender !== 0 && gender !== 1)) {
			return json({ error: 'Gender must be either male or female' }, { status: 400 });
		}

		if (
			isNaN(latitude) ||
			typeof latitude !== 'number' ||
			isNaN(longitude) ||
			typeof longitude !== 'number'
		) {
			return json({ error: 'Invalid location coordinates' }, { status: 400 });
		}

        // Validate social links
		if (
			socialLinks !== undefined &&
			(!Array.isArray(socialLinks) || socialLinks.some((link) => typeof link !== 'string'))
		) {
			return json({ error: 'Social links must be an array of strings' }, { status: 400 });
		}

        // Validate avatar (optional). Accept small data URLs or external URLs.
        let avatar: string | undefined = undefined;
        if (typeof avatarDataUrl === 'string' && avatarDataUrl.trim().length > 0) {
            const val = avatarDataUrl.trim();
            if (val.startsWith('data:image/')) {
                // enforce max size ~200KB to avoid overloading payload
                const approxBytes = Math.ceil((val.length * 3) / 4);
                if (approxBytes > 200_000) {
                    return json({ error: 'avatar image too large (max 200KB)' }, { status: 400 });
                }
                avatar = val;
            } else if (/^https?:\/\//.test(val)) {
                avatar = val;
            } else {
                return json({ error: 'invalid avatar format' }, { status: 400 });
            }
        }

		// Check if tag is already taken by another user
		const existingUsers = await search_by_payload<User>(
			{
				s: 'u',
				t: tag.trim()
			},
			null,
			1
		);

		// if (existingUsers.length > 0 && existingUsers[0].i !== locals.user.i) {
		// 	return json({ error: 'This tag is already taken' }, { status: 409 });
		// }

		// Update user data
		//

		const updatedUser: Partial<User> = {
			t: tag.trim(),
            ...(avatar ? { av: avatar } : {}),
			d: description.trim(),
			a: age,
			g: gender,
			l: latitude,
			n: longitude,
			w: whatsappLink.trim(),
			x: socialLinks
				? socialLinks
						.filter((link: string) => link.trim() !== '')
						.map((link: string) => link.trim())
				: []
		};

		// console.log('eu lu', locals.user)

		if (!locals.user.i) {
			console.error(`!locals.user.i -edit_user server route`);
			return error(500);
		}

		await qdrant.setPayload('i', {
			wait: true,
			payload: updatedUser, // example: updating a username
			points: [locals.user.i]
		});

        const vector = await embed(updatedUser.d as string)

		if (!vector) {
			console.error('error creating embedding for user', locals.user, updatedUser);
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

		return json({
			success: true,
			message: 'Profile updated successfully'
		});
	} catch (err) {
		console.error('Error updating user profile:', err);
		return json({ error: 'Failed to update profile' }, { status: 500 });
	}
};
