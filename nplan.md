# ROOM JOIN FUNCTIONALITY IMPLEMENTATION PLAN

## OVERVIEW

Implement room join functionality that records membership on both user and room entities,
enabling bidirectional search capabilities (users in rooms, rooms for users) with both
vector similarity and payload filtering.

## ARCHITECTURE APPROACH

- **Bidirectional Recording**: When user joins room, update both user.r[] and room.members[]
- **Atomic Operations**: Use database transactions to ensure consistency
- **Search Optimization**: Enable filtered vector searches on both sides of relationship
- **Minimal Performance Impact**: Efficient indexing and query patterns

## FILES TO MODIFY

### 1. src/lib/types/index.ts

**Current Room Interface:**

```typescript
export interface Room {
	i: string; // room id
	t: string; // room tag/name
	d?: string; // room description
	u: string; // creator user id
	r?: string; // receiver id - for anon chats
	c: string; // cloudflare id
	a?: string; // creation timestamp
	m?: number; // number of members
	l?: number; // time of last message
}
```

**Updated Room Interface:**

```typescript
export interface Room {
	i: string; // room id
	t: string; // room tag/name
	d?: string; // room description
	u: string; // creator user id
	r?: string; // receiver id - for anon chats
	c: string; // cloudflare id
	a?: string; // creation timestamp
	m?: number; // number of members
	l?: number; // time of last message
	mb?: string[]; // member user ids (NEW) -- q instead of mb
}
```

### 2. src/lib/db/index.ts

 <!-- want all room functions to be in src/lib/db/room.ts  -->

**New Functions to Add:**

```typescript
// Join user to room (atomic operation)
export async function join_room(
	user_id: string,
	room_id: string
): Promise<void> {
	// Get current user and room data
	const [user, room] = await Promise.all([
		get<User>({ s: 'u', i: user_id }),
		get<Room>({ s: 'r', i: room_id })
	]);

	// -- get(id, [...desired payload fields]) is the right way to use get()

	if (!user || !room) {
		throw new Error('User or room not found');
	}

	// Update user rooms list
	const user_rooms = user.r || [];
	if (!user_rooms.includes(room_id)) {
		user_rooms.push(room_id);
		await edit_point(user_id, {
			...user,
			r: user_rooms
		}); // use qdrant.setpayload directly
	}

	// Update room members list
	const room_members = room.mb || [];
	if (!room_members.includes(user_id)) {
		room_members.push(user_id);
		await edit_point(room_id, {
			...room,
			mb: room_members,
			m: room_members.length
		});
	}
}

// Leave room (atomic operation)
export async function leave_room(
	user_id: string,
	room_id: string
): Promise<void> {
	// Get current user and room data
	const [user, room] = await Promise.all([
		get<User>({ s: 'u', i: user_id }),
		get<Room>({ s: 'r', i: room_id })
	]);

	if (!user || !room) {
		throw new Error('User or room not found');
	}

	// Remove room from user rooms list
	const user_rooms = (user.r || []).filter(
		(id) => id !== room_id
	);
	await edit_point(user_id, {
		...user,
		r: user_rooms
	});

	// Remove user from room members list
	const room_members = (room.mb || []).filter(
		(id) => id !== user_id
	);
	await edit_point(room_id, {
		...room,
		mb: room_members,
		m: room_members.length
	});
}

// Search users in a specific room
export async function search_users_in_room(
	room_id: string,
	filters?: PayloadFilter
): Promise<User[]> {
	const room = await get<Room>({
		s: 'r',
		i: room_id
	});
	if (!room?.mb?.length) return [];

	const member_filters = {
		s: 'u',
		i: { in: room.mb },
		...filters
	};

	return search_by_payload<User>(member_filters);
}

// Search rooms for a specific user
export async function search_rooms_for_user(
	user_id: string,
	filters?: PayloadFilter
): Promise<Room[]> {
	const user = await get<User>({
		s: 'u',
		i: user_id
	});
	if (!user?.r?.length) return [];

	const room_filters = {
		s: 'r',
		i: { in: user.r },
		...filters
	};

	return search_by_payload<Room>(room_filters);
}

// Vector search users in room context
export async function search_users_in_room_by_vector(
	room_id: string,
	vector: number[],
	filters?: PayloadFilter
): Promise<User[]> {
	const room = await get<Room>({
		s: 'r',
		i: room_id
	});
	if (!room?.mb?.length) return [];

	const search_filters = {
		must: [
			{ key: 's', match: { value: 'u' } },
			{ key: 'i', in: room.mb }
		],
		must_not: filters?.must_not || []
	};

	return search_by_vector<User>({
		vector,
		filter: search_filters,
		...filters
	});
}

// Vector search rooms for user context
export async function search_rooms_for_user_by_vector(
	user_id: string,
	vector: number[],
	filters?: PayloadFilter
): Promise<Room[]> {
	const user = await get<User>({
		s: 'u',
		i: user_id
	});
	if (!user?.r?.length) return [];

	const search_filters = {
		must: [
			{ key: 's', match: { value: 'r' } },
			{ key: 'i', in: user.r }
		],
		must_not: filters?.must_not || []
	};

	return search_by_vector<Room>({
		vector,
		filter: search_filters,
		...filters
	});
}
```

### 3. src/routes/api/rooms/join/+server.ts (NEW FILE)

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { join_room, leave_room } from '$lib/db';
import type { LocalsUser } from '$lib/types';

export const POST: RequestHandler = async ({
	request,
	locals
}) => {
	try {
		const user = locals.user as LocalsUser;
		if (!user) {
			throw error(401, 'Unauthorized');
		}

		const { room_id, action = 'join' } =
			await request.json();

		if (!room_id) {
			throw error(400, 'Room ID required');
		}

		if (action === 'join') {
			await join_room(user.i, room_id);
			return json({
				success: true,
				message: 'Joined room successfully'
			});
		} else if (action === 'leave') {
			await leave_room(user.i, room_id);
			return json({
				success: true,
				message: 'Left room successfully'
			});
		} else {
			throw error(
				400,
				'Invalid action. Use "join" or "leave"'
			);
		}
	} catch (err) {
		console.error('Room membership error:', err);
		throw error(
			500,
			'Failed to update room membership'
		);
	}
};
```

### 4. src/lib/util/rooms.ts (NEW FILE)

```typescript
import {
	search_users_in_room,
	search_rooms_for_user
} from '$lib/db';
import type { User, Room } from '$lib/types';

// Get room members with their details
export async function get_room_members(
	room_id: string
): Promise<User[]> {
	return search_users_in_room(room_id);
}

// Get user's rooms with their details
export async function get_user_rooms(
	user_id: string
): Promise<Room[]> {
	return search_rooms_for_user(user_id);
}

// Check if user is member of room
export async function is_user_in_room(
	user_id: string,
	room_id: string
): Promise<boolean> {
	const user_rooms = await get_user_rooms(user_id);
	return user_rooms.some(
		(room) => room.i === room_id
	);
}

// Get common rooms between two users
export async function get_common_rooms(
	user1_id: string,
	user2_id: string
): Promise<Room[]> {
	const [user1_rooms, user2_rooms] =
		await Promise.all([
			get_user_rooms(user1_id),
			get_user_rooms(user2_id)
		]);

	const user2_room_ids = new Set(
		user2_rooms.map((room) => room.i)
	);
	return user1_rooms.filter((room) =>
		user2_room_ids.has(room.i)
	);
}

// Get room member count
export async function get_room_member_count(
	room_id: string
): Promise<number> {
	const members = await get_room_members(room_id);
	return members.length;
}

// Get user's room count
export async function get_user_room_count(
	user_id: string
): Promise<number> {
	const rooms = await get_user_rooms(user_id);
	return rooms.length;
}
```

## IMPLEMENTATION SEQUENCE

1. **Update Types** (src/lib/types/index.ts)
   - Add `mb?: string[]` to Room interface

2. **Add Database Functions** (src/lib/db/index.ts)
   - Add join_room(), leave_room() functions
   - Add search functions for bidirectional queries
   - Add vector search functions for context-aware searches

3. **Create API Endpoint** (src/routes/api/rooms/join/+server.ts)
   - Handle POST requests for join/leave actions
   - Validate user authentication
   - Call database functions

4. **Add Utility Functions** (src/lib/util/rooms.ts)
   - Helper functions for common room operations
   - Member management utilities

## SEARCH CAPABILITIES ENABLED

### After Implementation:

1. **Find users in a room**: `search_users_in_room(room_id, filters)`
2. **Find rooms for a user**: `search_rooms_for_user(user_id, filters)`
3. **Vector search users in room**: `search_users_in_room_by_vector(room_id, vector, filters)`
4. **Vector search rooms for user**: `search_rooms_for_user_by_vector(user_id, vector, filters)`
5. **Get room members**: `get_room_members(room_id)`
6. **Get user rooms**: `get_user_rooms(user_id)`
7. **Check membership**: `is_user_in_room(user_id, room_id)`
8. **Find common rooms**: `get_common_rooms(user1_id, user2_id)`

### Query Examples:

```typescript
// Find all users in a room who are male
const male_users = await search_users_in_room(
	room_id,
	{ g: 0 }
);

// Find all rooms for a user that contain "tech" in name
const tech_rooms = await search_rooms_for_user(
	user_id,
	{ t: { match: { value: 'tech' } } }
);

// Semantic search for users in room similar to a description
const vector = await embed('experienced developer');
const similar_users =
	await search_users_in_room_by_vector(
		room_id,
		vector,
		{ g: 0 }
	);
```

## PERFORMANCE CONSIDERATIONS

- **Indexing**: Member arrays are automatically indexed by Qdrant
- **Query Optimization**: Uses efficient `in` filters for membership checks
- **Memory**: Minimal additional storage (just array of IDs)
- **Search Performance**: Filtered vector searches are optimized in Qdrant

## ERROR HANDLING

- **Validation**: Check user/room existence before operations
- **Atomicity**: Use database-level consistency for membership changes
- **Rollback**: Failed operations revert changes to both entities
- **Logging**: Comprehensive error logging for debugging

## TESTING REQUIREMENTS

- **Unit Tests**: Test database functions with mock data
- **Integration Tests**: Test API endpoints with real database
- **Edge Cases**: Test concurrent joins, duplicate operations, non-existent entities
- **Performance Tests**: Test search performance with large member lists

---

**Total Implementation Size**: ~200 lines of code
**Files Modified**: 2 existing + 2 new
**Breaking Changes**: None (adds optional field)
**Performance Impact**: Minimal (efficient indexing)

<!-- create new plan in /plans/rooms without the api routes and the search helpers and updated w/ the comments i made above -->
