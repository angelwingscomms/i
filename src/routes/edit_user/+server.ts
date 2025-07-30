import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { qdrant, searchByPayload } from '$lib/db';
import type { User } from '$lib/types';
import { GoogleGenAI } from '@google/genai/node';
import { collection } from '$lib/constants';

export const POST: RequestHandler = async ({ request, locals }) => {
	// console.log('eu--')
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { tag, description, age, gender, latitude, longitude, whatsapp, socialLinks } =
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

		// Check if tag is already taken by another user
		const existingUsers = await searchByPayload<User>(
			{
				s: 'u',
				t: tag.trim()
			},
			1
		);

		// if (existingUsers.length > 0 && existingUsers[0].i !== locals.user.i) {
		// 	return json({ error: 'This tag is already taken' }, { status: 409 });
		// }

		// Update user data
		//

		const updatedUser: Partial<User> = {
			t: tag.trim(),
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

		const ai = new GoogleGenAI({});
		const embeddings = (
			await ai.models.embedContent({
				model: 'gemini-embedding-001',
				contents: updatedUser.t || ''
			})
		).embeddings;
		if (!embeddings) return error(500);

		const vector = embeddings[0].values;

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
