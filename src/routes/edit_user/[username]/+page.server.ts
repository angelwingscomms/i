import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { searchByPayload, upsertPoint } from '$lib/db';
import type { User } from '$lib/types';
import axios from 'axios';
import { GEMINI_API_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		redirect(302, '/google');
	}

	const { username } = params;

	try {
		// Find user by tag (username)
		const users = await searchByPayload<User>(
			{
				s: 'u',
				t: username
			},
			1
		);

		if (users.length === 0) {
			throw error(404, 'User not found');
		}

		const user = users[0];

		// Check if this is the logged-in user
		if (user.i !== locals.user.i) {
			throw error(403, 'You can only edit your own profile');
		}

		return {
			user: user
		};
	} catch (err) {
		console.error('Error loading user:', err);
		throw error(500, 'Failed to load user');
	}
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user) {
			redirect(302, '/google');
		}

		const formData = await request.formData();
		const tag = formData.get('tag') as string;
		const description = formData.get('description') as string;
		const age = parseInt(formData.get('age') as string);
		const gender = parseInt(formData.get('gender') as string);
		const latitude = parseFloat(formData.get('latitude') as string);
		const longitude = parseFloat(formData.get('longitude') as string);
		const whatsappLink = (formData.get('whatsapp') as string) || '';

		// Validate inputs
		if (!tag || tag.trim().length === 0) {
			return {
				error: 'Tag is required'
			};
		}

		if (!description || description.trim().length === 0) {
			return {
				error: 'Description is required'
			};
		}

		if (isNaN(age) || age < 18 || age > 120) {
			return {
				error: 'Age must be between 18 and 120'
			};
		}

		if (gender !== 0 && gender !== 1) {
			return {
				error: 'Gender must be either 0 (male) or 1 (female)'
			};
		}

		if (isNaN(latitude) || isNaN(longitude)) {
			return {
				error: 'Invalid location coordinates'
			};
		}

		try {
			// Check if tag is already taken by another user
			const existingUsers = await searchByPayload<User>(
				{
					s: 'u',
					t: tag.trim()
				},
				1
			);

			if (existingUsers.length > 0 && existingUsers[0].i !== locals.user.i) {
				return {
					error: 'This tag is already taken'
				};
			}

			// Update user data
			const updatedUser: User = {
				...locals.user,
				t: tag.trim(),
				d: description.trim(),
				a: age,
				g: gender,
				l: latitude,
				n: longitude,
				w: whatsappLink.trim()
			};

			await upsertPoint(updatedUser);

			return {
				success: true,
				message: 'Profile updated successfully'
			};
		} catch (err) {
			console.error('Error updating user:', err);
			return {
				error: 'Failed to update profile'
			};
		}
	}
};
