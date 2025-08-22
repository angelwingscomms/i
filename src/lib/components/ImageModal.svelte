<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getFilenameFromUrl } from '$lib/util/file';

	interface Props {
		images: string[];
		currentIndex: number;
		onClose: () => void;
	}

	let { images, currentIndex = $bindable(0), onClose }: Props = $props();

	let modalElement: HTMLElement;
	let touchStartX = 0;
	let touchStartY = 0;
	let isDragging = false;
	let dragOffset = 0;

	function closeModal() {
		onClose();
	}

	function nextImage() {
		if (currentIndex < images.length - 1) {
			currentIndex++;
		}
	}

	function prevImage() {
		if (currentIndex > 0) {
			currentIndex--;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Escape':
				closeModal();
				break;
			case 'ArrowLeft':
				prevImage();
				break;
			case 'ArrowRight':
				nextImage();
				break;
		}
	}

	function handleTouchStart(event: TouchEvent) {
		touchStartX = event.touches[0].clientX;
		touchStartY = event.touches[0].clientY;
		isDragging = false;
		dragOffset = 0;
	}

	function handleTouchMove(event: TouchEvent) {
		if (event.touches.length !== 1) return;

		const currentX = event.touches[0].clientX;
		const currentY = event.touches[0].clientY;
		const deltaX = currentX - touchStartX;
		const deltaY = currentY - touchStartY;

		// Only consider horizontal swipes
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
			isDragging = true;
			dragOffset = deltaX;
		}
	}

	function handleTouchEnd() {
		if (!isDragging) return;

		const threshold = 100;
		if (dragOffset > threshold && currentIndex > 0) {
			prevImage();
		} else if (dragOffset < -threshold && currentIndex < images.length - 1) {
			nextImage();
		}

		isDragging = false;
		dragOffset = 0;
	}

	function downloadImage() {
		const link = document.createElement('a');
		link.href = images[currentIndex];
		link.download = getFilenameFromUrl(images[currentIndex]);
		link.target = '_blank';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	// Handle modal backdrop click
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === modalElement) {
			closeModal();
		}
	}

	$effect(() => {
		if (modalElement) {
			document.addEventListener('keydown', handleKeydown);
			return () => document.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="image-modal"
	bind:this={modalElement}
	onclick={handleBackdropClick}
	transition:fade={{ duration: 200 }}
>
	<div class="modal-content">
		<!-- Close button -->
		<button class="close-btn" onclick={closeModal} aria-label="Close">
			<i class="fas fa-times"></i>
		</button>

		<!-- Navigation arrows -->
		{#if images.length > 1}
			<button
				class="nav-btn nav-prev"
				onclick={prevImage}
				disabled={currentIndex === 0}
				aria-label="Previous image"
			>
				<i class="fas fa-chevron-left"></i>
			</button>
			<button
				class="nav-btn nav-next"
				onclick={nextImage}
				disabled={currentIndex === images.length - 1}
				aria-label="Next image"
			>
				<i class="fas fa-chevron-right"></i>
			</button>
		{/if}

		<!-- Image container with touch support -->
		<div
			class="image-container"
			ontouchstart={handleTouchStart}
			ontouchmove={handleTouchMove}
			ontouchend={handleTouchEnd}
		>
			<img
				src={images[currentIndex]}
				alt={getFilenameFromUrl(images[currentIndex])}
				draggable="false"
			/>
		</div>

		<!-- Image info and controls -->
		<div class="image-footer">
			<div class="image-info">
				<span class="filename">{getFilenameFromUrl(images[currentIndex])}</span>
				{#if images.length > 1}
					<span class="counter">{currentIndex + 1} / {images.length}</span>
				{/if}
			</div>
			<button class="download-btn" onclick={downloadImage} aria-label="Download">
				<i class="fas fa-download"></i>
			</button>
		</div>
	</div>
</div>

<style>
	.image-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		box-sizing: border-box;
	}

	.modal-content {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.close-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 48px;
		height: 48px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		transition: all 0.2s ease;
		z-index: 10;
	}

	.close-btn:hover {
		background: rgba(0, 0, 0, 0.9);
		transform: scale(1.1);
	}

	.nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 48px;
		height: 48px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		transition: all 0.2s ease;
		z-index: 10;
	}

	.nav-btn:hover:not(:disabled) {
		background: rgba(0, 0, 0, 0.9);
		transform: translateY(-50%) scale(1.1);
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.nav-prev {
		left: 1rem;
	}

	.nav-next {
		right: 1rem;
	}

	.image-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		max-height: calc(100vh - 120px);
		overflow: hidden;
		touch-action: pan-y pinch-zoom;
	}

	.image-container img {
		max-width: 100%;
		max-height: 100%;
		width: auto;
		height: auto;
		object-fit: contain;
		border-radius: 4px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		user-select: none;
	}

	.image-footer {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.8);
		padding: 0.75rem 1rem;
		border-radius: 24px;
		display: flex;
		align-items: center;
		gap: 1rem;
		backdrop-filter: blur(8px);
		min-width: 200px;
		justify-content: space-between;
	}

	.image-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.filename {
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		text-align: center;
	}

	.counter {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.75rem;
		text-align: center;
	}

	.download-btn {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: none;
		padding: 0.5rem;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		width: 40px;
		height: 40px;
	}

	.download-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(1.1);
	}

	@media (max-width: 768px) {
		.image-modal {
			padding: 1rem;
		}

		.close-btn,
		.nav-btn {
			width: 40px;
			height: 40px;
			font-size: 1rem;
		}

		.nav-prev {
			left: 0.5rem;
		}

		.nav-next {
			right: 0.5rem;
		}

		.image-footer {
			bottom: 0.5rem;
			padding: 0.5rem 0.75rem;
			min-width: 150px;
		}

		.filename {
			font-size: 0.8rem;
		}

		.counter {
			font-size: 0.7rem;
		}
	}

	@media (max-width: 480px) {
		.image-modal {
			padding: 0.5rem;
		}

		.close-btn,
		.nav-btn {
			width: 36px;
			height: 36px;
			font-size: 0.9rem;
		}

		.nav-prev {
			left: 0.25rem;
		}

		.nav-next {
			right: 0.25rem;
		}

		.image-footer {
			padding: 0.375rem 0.5rem;
			min-width: 120px;
		}
	}
</style>
