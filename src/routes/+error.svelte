<script lang="ts">
	import { page } from '$app/state';
</script>

<div
	class="from-bg-primary via-bg-secondary to-bg-tertiary flex min-h-screen items-center justify-center bg-gradient-to-br"
>
	<div class="mx-auto max-w-md p-8 text-center">
		<div class="mb-8">
			<svg
				width="64"
				height="64"
				viewBox="0 0 24 24"
				fill="none"
				class="mx-auto text-red-500"
			>
				<path
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
					fill="currentColor"
				/>
			</svg>
		</div>
		<h1 class="mb-4 text-2xl font-bold text-white">
			Something went wrong
		</h1>
		<p class="mb-6 text-gray-300">
			{#if page.error?.message}
				{page.error.message}
			{:else}
				An unexpected error occurred
			{/if}
		</p>
		<div class="space-y-2">
			<button
				class="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
				onclick={() => (window.location.href = '/')}
			>
				Go Home
			</button>
			<button
				class="w-full rounded-lg bg-gray-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-700"
				onclick={() => window.location.reload()}
			>
				Reload Page
			</button>
		</div>
		{#if page.error?.stack}
			<details class="mt-6 text-left">
				<summary
					class="cursor-pointer text-sm text-gray-400 hover:text-gray-300"
					>Technical Details</summary
				>
				<pre
					class="mt-2 max-h-32 overflow-auto rounded bg-gray-800 p-3 text-xs text-gray-300">{page
						.error.stack}</pre>
			</details>
		{/if}
	</div>
</div>

<style>
	details summary::-webkit-details-marker {
		display: none;
	}

	details summary::before {
		content: '▶ ';
		font-size: 0.8em;
	}

	details[open] summary::before {
		content: '▼ ';
	}
</style>
