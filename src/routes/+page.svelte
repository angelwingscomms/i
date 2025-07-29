<!-- Original UI and functionality
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
		const { tag, description, age, gender, latitude, longitude, whatsapp } = await request.json();

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
			w: whatsappLink.trim()
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
-->

<script lang="ts">
	export let data: PageData;
	import { type PageData } from './$types';
	import { browser } from '$app/environment';
	import { toast, toasts } from '$lib/util/toast';

	async function copyProfileLink() {
		if (!browser) return; // Ensure client-side environment

		// In a real application, 'your-user-id' would be replaced by the actual user's ID,
		// typically passed as a prop, fetched from a store, or available in the session.
		const profileLink = `${window.location.origin}/user/${data.user.i}`;

		try {
			await navigator.clipboard.writeText(profileLink);
			// Assuming `toast` is imported from a common utility, e.g., '$lib/toast'
			// If not, this import would need to be added to the script block:
			// import { toast } from '$lib/toast'; // or similar path
			// toast.success('Profile link copied!');
			alert('profile link copied')
		} catch (err) {
			console.error('Failed to copy profile link:', err);
			alert('Failed to copy link.');
			// toast.error('Failed to copy link.');
		}
	}
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
    <h1 class="mb-6 text-center text-3xl font-bold">quickly find what you have in common with other people</h1>
	<p class="mb-8 max-w-md text-center text-lg">
		describe yourself, your beliefs, your passions, and stuff you like to do or talk about, with a text or a voice note. Our AI compares profiles privately, showing only
		what you have in common with other. Feel free to be open—your full details stay private
	</p>

	<a
	href='/edit_user'
		class="mb-4 w-full text-center max-w-md rounded-md bg-green-500 p-2 text-white hover:bg-green-600"
	>
		Edit Your Profile
	</a>

	<!-- New section to display the profile link with a copy button -->
	<p class="mt-8 mb-4 text-center text-base text-gray-600 max-w-md">
		Share your profile with others so they can see what they have in common with you.
	</p>
	<div class="w-full max-w-md">
		<label for="profile-link" class="mb-2 block text-sm font-medium text-gray-700">Your Profile Link:</label>
		<div class="flex items-center space-x-2">
			<input
				id="profile-link"
				type="text"
				readonly
				value={browser ? `${window.location.origin}/user/${data.user.i}` : 'Loading link...'}
				class="flex-1 rounded-md border border-gray-300 p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<button
				on:click={copyProfileLink}
				class="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 flex-shrink-0"
			>
				Copy
			</button>
		</div>
	</div>
</main>
