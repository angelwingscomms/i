<script lang="ts">
	import type RealtimeKitClient from '@cloudflare/realtimekit';
	import type { Recording } from '$lib/types';
	import { fade } from 'svelte/transition';
	import axios from 'axios';
	import { toast } from '$lib/util/toast';

	let { full_room_name, meeting, i, onClose }: { full_room_name: string; meeting: RealtimeKitClient; i: string; onClose: () => void } = $props();

	let recordings = $derived(meeting?.recording?.recordings || []);

	let downloading = $state(new Set<string>());

	const download = async (recordingId: string) => {
		if (downloading.has(recordingId)) return;
		downloading.add(recordingId);
		try {
			const res = await axios.get(`/r/${i}/get-recording-download-link?i=${recordingId}`);
			if (res.data.download_url) {
				const a = document.createElement('a');
				a.href = res.data.download_url;
				a.download = `recording-${recordingId}.mp4`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				toast.success('Download started');
			} else {
				toast.error('No download link available');
			}
		} catch (e) {
			console.error('Download error:', e);
			toast.error('Download failed');
		} finally {
			downloading.delete(recordingId);
		}
	};
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
	{#if recordings.length > 0}
		<div class="recordings-section">
			<h3 class="subtitle">Recordings</h3>
			<div class="recordings-list">
				{#each recordings as rec}
					<button class="btn download-btn" onclick={() => download(rec.id)} disabled={downloading.has(rec.id)}>
						{downloading.has(rec.id) ? 'Downloading...' : `Download ${rec.id.slice(-8)}`}
					</button>
				{/each}
			</div>
		</div>
	{/if}
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
	.recordings-section {
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid var(--border);
	}

	.recordings-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.download-btn {
		background: var(--btn);
		color: var(--btn-text);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 8px 12px;
		font-weight: 600;
		cursor: pointer;
		text-align: left;
	}
</style>