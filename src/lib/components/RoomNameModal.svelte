<script lang="ts">
	import { fade } from 'svelte/transition';

	let { full_room_name, onClose }: { full_room_name: string; onClose: () => void } = $props();
</script>

<div
	class="modal_backdrop"
	role="button"
	tabindex="0"
	onclick={onClose}
	onkeydown={(e) => e.key === 'Escape' && onClose()}
	in:fade={{ duration: 120 }}
></div>
<div class="modal card" in:fade={{ duration: 120 }}>
	<h2 class="subtitle">Room Name</h2>
	<p class="room-name">{full_room_name}</p>
	<div class="row gap">
		<button class="btn" onclick={onClose}>Close</button>
	</div>
</div>

<style>
	.modal_backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(10px);
	}
	.modal {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(520px, 92vw);
	}
	.card {
		background: transparent;
		border: 1px solid var(--color-theme-6);
		border-radius: 12px;
		padding: 12px;
	}
	.subtitle {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 8px;
	}
	.room-name {
		word-wrap: break-word;
		overflow-wrap: break-word;
	}
	.row {
		display: flex;
		gap: 8px;
	}
	.gap {
		display: grid;
		gap: 8px;
	}
	.btn {
		background: var(--btn);
		color: var(--btn-text);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 8px 12px;
		font-weight: 600;
		cursor: pointer;
	}
</style>