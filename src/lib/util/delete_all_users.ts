import { search_by_payload, qdrant } from '$lib/db';
import type { User } from '$lib/types';

export const delete_all_users = async () => {
	const allUsersToDelete =
		await search_by_payload<User>(
			{ s: 'u' },
			undefined,
			1_000_000
		); // Fetch up to 1 million users
	console.log(
		`Found ${allUsersToDelete.length} users to delete.`
	);
	for (const userToDelete of allUsersToDelete) {
		console.log(
			`Deleting user ID: ${userToDelete.i}`
		);
		if (!userToDelete.i) continue;
		await qdrant.delete('i', {
			points: [userToDelete.i]
		});
	}
};
