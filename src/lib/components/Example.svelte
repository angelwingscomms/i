<script>
	import { createEventDispatcher } from 'svelte'; // Rule: import/export syntax
	import type { Message } from '$lib/types'; // Use existing types

	// Rule: prop validation with $props({ room_id?: string, room_name: string, show_modal: $state<boolean>(false) })
	let { 
		room_id = $state(''), 
		room_name, 
		show_modal = $state(false) 
	} = $props(); // room_id optional, room_name required (validate: if !room_name throw error, but concise demo)

	// Rule: internal state with $state (e.g., loading: boolean)
	let loading = $state(false);

	// Rule: event dispatcher for extensibility (avoid React-like concepts)
	const dispatch = createEventDispatcher();

	// Rule: $effect for side effects, e.g., validate input client-side
	$effect(() => {
		if (!room_name) {
			// Rule: always validate input client-side and server-side; provide clear messages (demo toast, assume imported)
			console.warn('Room name required'); // placeholder for toast
		}
	});

	// Rule: event handling (e.g., on:click for modal toggle)
	function toggle_modal() {
		show_modal = !show_modal; // update state
		dispatch('modalToggle', { show: show_modal }); // emit event
	}

	// Rule: model patterns like controlling modals (e.g., show_reply_modal, passing full_room_name as 't' - here reply content as 'm')
	let demo_reply: Message = { i: 'demo', m: room_name, d: Date.now(), r: room_id, s: 'm' }; // mock Message
	let show_reply_modal = $state(false);

	function open_reply_modal() {
		show_reply_modal = true;
	}

	// Rule: avoid single-use vars; pass directly
</script>

<!-- Rule: avoid inline styles; only design system utilities (hypothetical classes from src/app.css) -->
<div class="example-component" role="group" aria-label="Example Component">
	<!-- Rule: conditional rendering -->
	{#if loading}
		<div class="loading-spinner" aria-live="polite">Loading...</div>
	{:else}
		<!-- room_name display -->
		<h3 class="room-title">{room_name}</h3>
		<!-- event handling -->
		<button class="btn-toggle" on:click={toggle_modal} aria-expanded={show_modal}>Toggle Modal</button>
		<!-- slots for extensibility -->
		<slot name="content" {room_id}>
			<p>Default content for {room_id}</p>
		</slot>
	{/if}

	<!-- Demo modal for reply previews (inspired by RoomNameModal transformation to ReplyDetails) -->
	{#if show_modal}
		<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
			<div class="modal-content">
				<h4 id="modal-title">Room: {room_name}</h4>
				<p>Room ID: {room_id}</p>
				<button on:click={toggle_modal} aria-label="Close modal">Close</button>
				<!-- Rule: slots -->
				<slot name="footer"></slot>
			</div>
		</div>
	{/if}

	<!-- Separate reply modal control pattern -->
	<button class="btn-reply" on:click={open_reply_modal}>Preview Reply</button>
	{#if show_reply_modal}
		<div class="reply-modal" role="dialog" aria-modal="true">
			<div class="reply-content">
				<!-- passing full_room_name as 't' - here content as 'm' -->
				<p>{demo_reply.m}</p> <!-- contentSnippet would be derived, but concise -->
				<small>Timestamp: {new Date(demo_reply.d).toLocaleString()}</small>
				<button on:click={() => show_reply_modal = false} aria-label="Close reply modal">Close</button>
			</div>
		</div>
	{/if}

	<!-- Rule: ensuring accessibility with ARIA attributes -->
</div>

<!-- No <style> block: Rule: avoid inline styles and style blocks; only use design system utilities -->;