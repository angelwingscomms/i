<script lang="ts">
	import { navigating } from '$app/stores'; // Import navigating store
	import type { User } from '$lib/types';

	export let user: User | null = null;

	// The isActive function was removed as it was unused and always returned false.
	// Its usages in the template were replaced with 'false' to maintain original behavior
	// and resolve diagnostic errors.
</script>

<nav class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
	<div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
		<div class="flex items-center">
			<a href="/" class="flex items-center no-underline" aria-label="Home">
				<span class="text-4xl font-bold text-blue-600 font-sans">
					{#if $navigating}
						<svg class="animate-spin h-9 w-9 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					{/if}
				</span>
			</a>
		</div>

		<div class="flex items-center gap-4 md:flex hidden">
			{#if user}
				<!-- The original isActive check here was commented out already. -->
				<a href="/search" class="{false ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'} flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
						/>
					</svg>
					Search
				</a>

				<a href="/edit_user" class="{false ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'} flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
						/>
					</svg>
					edit profile
				</a>

				<div class="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
					<a href="/user/{user.i}" class="text-gray-700 font-semibold text-sm">{user.t}</a>
					<a href="/api/logout" class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg text-sm font-medium transition-all duration-200">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
							/>
						</svg>
						logout
					</a>
				</div>
			{:else}
				<a href="/google" class="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M23,11H21V9H19V11H17V13H19V15H21V13H23M8,5V7H12V5M10,2A8,8 0 0,1 18,10A8,8 0 0,1 10,18A8,8 0 0,1 2,10A8,8 0 0,1 10,2M10,4A6,6 0 0,0 4,10A6,6 0 0,0 10,16A6,6 0 0,0 16,10A6,6 0 0,0 10,4Z"
						/>
					</svg>
					login w Google
				</a>
			{/if}
		</div>

		<!-- Mobile menu button -->
		<div class="md:hidden block">
			<button class="p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200" aria-label="Toggle menu">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
					<path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
				</svg>
			</button>
		</div>
	</div>
</nav>
