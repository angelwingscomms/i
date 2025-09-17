<script lang="ts">
	import { createBubbler } from 'svelte/legacy';
	import { fade } from 'svelte/transition';

	interface ModalProps {
		open?: boolean;
		fixed?: boolean;
		children: any;
		title?: string;
		showClose?: boolean;
		closeOnBackdrop?: boolean;
		closeOnEscape?: boolean;
		width?: string;
		height?: string;
	}

	let {
		open = $bindable(false),
		children,
		fixed,
		title = '',
		showClose = true,
		closeOnBackdrop = true,
		closeOnEscape = true,
		width = 'min(720px, 92vw)',
		height = 'auto'
	}: ModalProps = $props();

	function handleClose() {
		if (fixed) return;
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (closeOnEscape && e.key === 'Escape') {
			handleClose();
		}
	}
</script>

{#if open}
	<div
		class="modal-backdrop"
		role="dialog"
		tabindex="-1"
		onclick={() => closeOnBackdrop && handleClose()}
		onkeydown={handleKeydown}
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 150 }}
	>
		<div
			class="modal"
			style="width: {width}; height: {height};"
			in:fade={{ duration: 200, delay: 50 }}
			out:fade={{ duration: 150 }}
		>
			{#if title || showClose}
				<div class="modal-header">
					{#if title}
						<h2 class="modal-title">{title}</h2>
					{/if}
					{#if showClose}
						<button class="modal-close" onclick={handleClose} aria-label="Close modal"> × </button>
					{/if}
				</div>
			{/if}
			<div class="modal-content">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal {
		background: var(--bg-primary, white);
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		max-height: 90vh;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border-color, #eee);
	}

	.modal-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary, #333);
	}

	.modal-close {
		background: transparent;
		border: none;
		font-size: 1.5rem;
		line-height: 1;
		padding: 0.5rem;
		cursor: pointer;
		color: var(--text-secondary, #666);
		transition: color 0.2s;
	}

	.modal-close:hover {
		color: var(--text-primary, #333);
	}

	.modal-content {
		padding: 1.5rem;
		overflow-y: auto;
	}
</style>
