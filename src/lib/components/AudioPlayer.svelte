<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		url: string;
	}

	let { url }: Props = $props();

	let audio: HTMLAudioElement;
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let progress = $state(0);
	let isDragging = $state(false);

	onMount(() => {
		audio = new Audio(url);

		audio.addEventListener('loadedmetadata', () => {
			duration = audio.duration;
		});

		audio.addEventListener('timeupdate', () => {
			if (!isDragging) {
				currentTime = audio.currentTime;
				progress = (currentTime / duration) * 100;
			}
		});

		audio.addEventListener('ended', () => {
			isPlaying = false;
			currentTime = 0;
			progress = 0;
		});

		audio.addEventListener('play', () => {
			isPlaying = true;
		});

		audio.addEventListener('pause', () => {
			isPlaying = false;
		});
	});

	function togglePlay() {
		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
	}

	function formatTime(seconds: number): string {
		if (!seconds || isNaN(seconds)) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function handleProgressClick(event: MouseEvent) {
		const rect = (
			event.target as HTMLElement
		).getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const newProgress = (clickX / rect.width) * 100;
		const newTime = (newProgress / 100) * duration;

		audio.currentTime = newTime;
		currentTime = newTime;
		progress = newProgress;
	}

	function handleProgressDrag(event: MouseEvent) {
		if (!isDragging) return;

		const rect = (
			event.target as HTMLElement
		).getBoundingClientRect();
		const clientX = event.clientX;
		const dragX = Math.max(
			0,
			Math.min(clientX - rect.left, rect.width)
		);
		const newProgress = (dragX / rect.width) * 100;

		progress = newProgress;
	}

	function startDrag() {
		isDragging = true;
		document.addEventListener(
			'mousemove',
			handleProgressDrag
		);
		document.addEventListener('mouseup', endDrag);
	}

	function endDrag() {
		if (isDragging) {
			const newTime = (progress / 100) * duration;
			audio.currentTime = newTime;
			currentTime = newTime;
		}
		isDragging = false;
		document.removeEventListener(
			'mousemove',
			handleProgressDrag
		);
		document.removeEventListener('mouseup', endDrag);
	}
</script>

<div class="audio-player">
	<button
		class="play-btn"
		onclick={togglePlay}
		aria-label={isPlaying ? 'Pause' : 'Play'}
	>
		<i
			class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"
		></i>
	</button>

	<div class="progress-container">
		<div
			class="progress-bar"
			onclick={handleProgressClick}
		>
			<div
				class="progress-fill"
				style="width: {progress}%"
			></div>
			<div
				class="progress-handle"
				style="left: {progress}%"
				onmousedown={startDrag}
				ondragstart={(e) => e.preventDefault()}
			></div>
		</div>
	</div>

	<div class="time-display">
		<span class="current-time"
			>{formatTime(currentTime)}</span
		>
		<span class="duration"
			>{formatTime(duration)}</span
		>
	</div>
</div>

<style>
	.audio-player {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		background: var(--color-bg-2, #f8f9fa);
		border-radius: 6px;
		width: 100%;
	}

	.play-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--color-theme-1, #007bff);
		color: white;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.play-btn:hover {
		background: var(--color-theme-2, #0056b3);
		transform: scale(1.05);
	}

	.play-btn:active {
		transform: scale(0.95);
	}

	.progress-container {
		flex: 1;
		position: relative;
	}

	.progress-bar {
		height: 6px;
		background: var(--color-bg-3, #e9ecef);
		border-radius: 3px;
		cursor: pointer;
		position: relative;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-theme-1, #007bff);
		border-radius: 3px;
		transition: width 0.1s ease;
	}

	.progress-handle {
		position: absolute;
		top: 50%;
		width: 12px;
		height: 12px;
		background: white;
		border: 2px solid var(--color-theme-1, #007bff);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		cursor: grab;
		transition: all 0.2s ease;
		opacity: 0;
	}

	.progress-bar:hover .progress-handle {
		opacity: 1;
	}

	.progress-handle:active {
		cursor: grabbing;
		transform: translate(-50%, -50%) scale(1.2);
	}

	.time-display {
		display: flex;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--color-text-2, #6c757d);
		font-family: monospace;
		font-weight: 500;
		min-width: 60px;
		justify-content: flex-end;
	}

	.current-time {
		color: var(--color-text, #212529);
	}

	.duration {
		color: var(--color-text-3, #868e96);
	}

	@media (max-width: 480px) {
		.audio-player {
			gap: 0.5rem;
			padding: 0.375rem;
		}

		.play-btn {
			width: 28px;
			height: 28px;
		}

		.progress-bar {
			height: 4px;
		}

		.progress-handle {
			width: 10px;
			height: 10px;
		}

		.time-display {
			font-size: 0.7rem;
			min-width: 50px;
		}
	}
</style>
