<script lang="ts">
	import { getFileInfo, getFilenameFromUrl, isImage, isAudio } from '$lib/util/file';
	import AudioPlayer from './AudioPlayer.svelte';
	import ImageModal from './ImageModal.svelte';

	interface Props {
		url: string;
		mimeType?: string;
	}

	let { url, mimeType }: Props = $props();

	let showImageModal = $state(false);
	let currentImageIndex = $state(0);
	let allImages: string[] = $state([]);

	const fileInfo = getFileInfo(url, mimeType);
	const filename = getFilenameFromUrl(url);

	function downloadFile() {
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.target = '_blank';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function openImageModal() {
		if (isImage(url, mimeType)) {
			showImageModal = true;
		}
	}

	function closeImageModal() {
		showImageModal = false;
	}

	$effect(() => {
		// Update allImages when component props change
		if (isImage(url, mimeType)) {
			// We'll get all images from parent component later
			allImages = [url]; // For now, just current image
		}
	});
</script>

<div class="file-widget">
	{#if isImage(url, mimeType)}
		<!-- Image Widget -->
		<div class="file-widget-content image-widget" onclick={openImageModal}>
			<div class="file-icon">
				<i class="fas {fileInfo.icon}"></i>
			</div>
			<div class="file-info">
				<div class="filename">{filename}</div>
				<div class="file-extension">.{fileInfo.extension}</div>
			</div>
			<button class="download-btn" onclick={downloadFile} aria-label="Download">
				<i class="fas fa-download"></i>
			</button>
		</div>
	{:else if isAudio(url, mimeType)}
		<!-- Audio Widget -->
		<div class="file-widget-content audio-widget">
			<div class="file-icon">
				<i class="fas {fileInfo.icon}"></i>
			</div>
			<div class="file-info">
				<div class="filename">{filename}</div>
				<div class="file-extension">.{fileInfo.extension}</div>
			</div>
			<div class="audio-player-container">
				<AudioPlayer {url} />
			</div>
			<button class="download-btn" onclick={downloadFile} aria-label="Download">
				<i class="fas fa-download"></i>
			</button>
		</div>
	{:else}
		<!-- Generic File Widget -->
		<div class="file-widget-content generic-widget">
			<div class="file-icon">
				<i class="fas {fileInfo.icon}"></i>
			</div>
			<div class="file-info">
				<div class="filename">{filename}</div>
				<div class="file-extension">.{fileInfo.extension}</div>
			</div>
			<button class="download-btn" onclick={downloadFile} aria-label="Download">
				<i class="fas fa-download"></i>
			</button>
		</div>
	{/if}
</div>

{#if showImageModal}
	<ImageModal
		images={allImages}
		currentIndex={currentImageIndex}
		onClose={closeImageModal}
	/>
{/if}

<style>
	.file-widget {
		display: inline-block;
		margin: 0.25rem 0.5rem 0.25rem 0;
	}

	.file-widget-content {
		display: flex;
		align-items: center;
		padding: 0.5rem 0.75rem;
		background: var(--color-bg-2, #f8f9fa);
		border: 1px solid var(--color-border, #e9ecef);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 200px;
		max-width: 300px;
	}

	.file-widget-content:hover {
		background: var(--color-bg-3, #e9ecef);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.file-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		margin-right: 0.75rem;
		color: var(--color-text-2, #6c757d);
		flex-shrink: 0;
	}

	.file-info {
		flex: 1;
		min-width: 0;
	}

	.filename {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text, #212529);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-bottom: 0.125rem;
	}

	.file-extension {
		font-size: 0.75rem;
		color: var(--color-text-3, #868e96);
		text-transform: uppercase;
		font-weight: 500;
	}

	.download-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: transparent;
		border: none;
		color: var(--color-text-2, #6c757d);
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.2s ease;
		flex-shrink: 0;
		margin-left: 0.5rem;
	}

	.download-btn:hover {
		background: var(--color-bg-4, #dee2e6);
		color: var(--color-text, #212529);
	}

	.audio-widget {
		flex-direction: column;
		align-items: stretch;
		padding: 0.75rem;
	}

	.audio-player-container {
		margin: 0.5rem 0;
		width: 100%;
	}

	.image-widget {
		cursor: pointer;
	}

	.image-widget:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}
</style>
