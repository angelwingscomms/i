<script lang='ts'>
	import { onMount, onDestroy } from 'svelte'; // Rule: import/export syntax (e.g., import { onMount, onDestroy } from 'svelte')
	import type { Room, Message } from '$lib/types';
	import Example from '$lib/components/Example.svelte'; // Integrate the Example component

	// Rule: $props() for destructuring load data with TypeScript interfaces (using existing Room, Message)
	let { data }: { data: { rooms: Room[]; messages: Message[] } } = $props();

	// Rule: $state for reactive UI state (e.g., selected_room)
	let selected_room = $state<Room | null>(null);

	// Rule: $derived for reactive statements; compute derived fields like isPrivate, derivedName from room._
	let rooms_with_details = $derived(data.rooms.map(room => ({
		...room,
		id: room.i, // alias for i (rule: i is the primary id everywhere)
		name: room.t, // alias for t
		description: room.a,
		createdAt: room.d,
		updatedAt: room.l,
		participants: room.x ? room.x.map(u_id => ({ id: u_id, name: 'User', avatar: '' })) : [], // mock resolved participants (User[] with id/name/avatar)
		isPrivate: room._ === ',' || room._ === '|', // derived from _ (rule: avoid single-use vars; pass directly)
		derivedName: room.t + (room.isPrivate ? ' (Private)' : '') // computed display name
	})));

	// Rule: $derived for messages with computed fields (e.g., contentSnippet, author)
	let messages_with_details = $derived(data.messages.map(msg => ({
		...msg,
		id: msg.i,
		contentSnippet: msg.m.length > 50 ? msg.m.substring(0, 50) + '...' : msg.m, // truncated m
		author: msg.u ? { id: msg.u, name: 'Author', avatar: '' } : null, // mock resolved author (User)
		timestamp: msg.d,
		parentRoomId: msg.r,
		attachments: msg.f || [] // alias for f
	})));

	// Rule: $effect for side effects like logging or API calls; optional localStorage persistence
	$effect(() => {
		if (selected_room) {
			localStorage.setItem('selected_room', JSON.stringify(selected_room.i)); // demo caching (rule: if rules involve caching, implement optional localStorage)
			console.log('Selected room changed:', selected_room.t); // side effect: logging
		}
	});

	let abort_controller = $state<AbortController | null>(null);

	// Rule: onMount/onDestroy for lifecycle management including AbortController for fetch cleanup
	onMount(() => {
		abort_controller = new AbortController(); // demo AbortController
		// e.g., fetch('/api/some', { signal: abort_controller.signal }); // hypothetical fetch
		return () => { // cleanup in onDestroy
			if (abort_controller) abort_controller.abort();
		};
	});

	onDestroy(() => {
		if (abort_controller) abort_controller.abort(); // ensure cleanup
	});

	// Rule: event handling (e.g., select room)
	function select_room(room: Room) {
		selected_room = room; // update state
	}
</script>

<!-- Rule: avoid inline styles and style blocks; only use design system utilities (assume classes from src/app.css) -->
<svelte:head>
	<title>Example Demo</title>
</svelte:head>

<div class="page-container"> <!-- hypothetical design system class -->
	<!-- Display dynamic content like room lists -->
	<h1 class="heading">Rooms</h1> <!-- design system class -->
	<ul class="room-list">
		{#each rooms_with_details as room}
			<li class="room-item" on:click={() => select_room(room)}>
				<!-- Rule: conditional rendering -->
				{#if room.isPrivate}
					<span class="private-badge">Private</span> <!-- ARIA: role="img" aria-label="Private room" -->
				{/if}
				{room.derivedName} <!-- dynamic content -->
				<!-- participants array display -->
				{#each room.participants as participant}
					<span>{participant.name}</span>
				{/each}
			</li>
		{/each}
	</ul>

	<!-- Display reply previews (messages) -->
	<h2 class="subheading">Recent Messages</h2>
	{#each messages_with_details as reply}
		<div class="reply-preview">
			<!-- author object display -->
			{#if reply.author}
				<strong>{reply.author.name}</strong>
			{/if}
			<p>{reply.contentSnippet}</p>
			<small>{new Date(reply.timestamp).toLocaleString()}</small> <!-- timestamp -->
			<!-- attachments -->
			{#if reply.attachments.length}
				<ul>
					{#each reply.attachments as att}
						<li><a href={att}>Attachment</a></li>
					{/each}
				</ul>
			{/if}
			<!-- parentRoomId -->
			<small>Room: {reply.parentRoomId}</small>
		</div>
	{/each}

	<!-- Integrate Example component -->
	<Example room_id={selected_room?.i} room_name={selected_room?.t || ''} />

	<!-- Rule: error boundaries (demo with {#if}) -->
	{#if !data.rooms.length}
		<p>No rooms found.</p>
	{/if}
</div>

<!-- Rule: ensuring accessibility with ARIA attributes (example on badge) -->
<style>
	/* Rule: avoid inline styles and style blocks; only use design system utilities - no custom styles here */
</style>;