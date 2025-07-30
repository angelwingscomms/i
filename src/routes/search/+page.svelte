<script lang="ts">
	import { page } from '$app/state';
	import axios from 'axios';
	import type { User, Group } from '$lib/types';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';

	export let data;

	// Search type toggle
	let searchType: 'users' | 'groups' = 'users';

	// User search params
	let genderFilter: number | null = null; // 0 for male, 1 for female, null for all
	let ageMin = 18;
	let ageMax = 99;
	let searchResults: User[] = [];

	// Group search params
	let groupNameFilter = '';
	let groupResults: Group[] = [];
	let activeGroupId: string | null = null;

	let isLoading = false;
	let errorMessage = '';

	async function handleSearch() {
		if (searchType === 'users' && ageMin > ageMax) {
			errorMessage = 'Minimum age cannot be greater than maximum age';
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			if (searchType === 'users') {
				const response = await axios.post('/search', {
					g: genderFilter,
					n: ageMin,
					x: ageMax
				});

				searchResults = response.data || [];
				groupResults = [];
			} else {
				const response = await axios.post('/api/search/groups', {
					name: groupNameFilter
				});

				groupResults = response.data.groups || [];
				searchResults = [];
			}
		} catch (error) {
			console.error('Search error:', error);
			errorMessage = 'An error occurred while searching. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function resetFilters() {
		if (searchType === 'users') {
			genderFilter = null;
			ageMin = 18;
			ageMax = 99;
			searchResults = [];
		} else {
			groupNameFilter = '';
			groupResults = [];
		}
		errorMessage = '';
	}

	function handleGroupDescriptionUpdate(groupId: string, newDescription: string) {
		// Update local state after successful update
		groupResults = groupResults.map(group =>
			group.id === groupId ? { ...group, description: newDescription } : group
		);
	}

	function toggleSearchType(type: 'users' | 'groups') {
		searchType = type;
		resetFilters();
	}
</script>

<div class="max-w-3xl mx-auto px-4 py-8">
	<header class="text-center mb-6">
		<h1 class="text-4xl text-blue-600 mb-2">Find Your Match</h1>
		<p class="text-gray-500 text-lg">Welcome back, {data.user?.t}!</p>
	</header>

	<!-- <div class="flex justify-center gap-4 mb-6">
		<button
			class="flex items-center gap-2 py-3 px-6 border-2 rounded-lg bg-white font-semibold text-base cursor-pointer transition-all duration-200 {searchType === 'users' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-500 border-gray-300 hover:border-blue-600 hover:text-blue-600'}"
			on:click={() => toggleSearchType('users')}
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
			</svg>
			Users
		</button>
		<button
			class="flex items-center gap-2 py-3 px-6 border-2 rounded-lg bg-white font-semibold text-base cursor-pointer transition-all duration-200 {searchType === 'groups' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-500 border-gray-300 hover:border-blue-600 hover:text-blue-600'}"
			on:click={() => toggleSearchType('groups')}
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
			</svg>
			Groups
		</button>
	</div> -->

	<div class="bg-slate-50 rounded-xl p-8 mb-8 border border-slate-200">
		{#if searchType === 'users'}
			<div class="grid gap-6 mb-6">
				<div class="flex flex-col gap-2">
					<label for="gender-filter" class="font-semibold text-gray-700 text-sm uppercase tracking-wider">Gender</label>
					<div class="flex gap-4 flex-wrap">
						<label class="flex items-center gap-2 cursor-pointer text-base">
							<input type="radio" id="gender-filter" bind:group={genderFilter} value={null} />
							All
						</label>
						<label class="flex items-center gap-2 cursor-pointer text-base">
							<input type="radio" bind:group={genderFilter} value={0} />
							Male
						</label>
						<label class="flex items-center gap-2 cursor-pointer text-base">
							<input type="radio" bind:group={genderFilter} value={1} />
							Female
						</label>
					</div>
				</div>

				<div class="flex flex-col gap-2">
					<label for="age-min" class="font-semibold text-gray-700 text-sm uppercase tracking-wider">Age Range</label>
					<div class="flex items-center gap-4 flex-wrap">
						<input
							type="number"
							id="age-min"
							bind:value={ageMin}
							min="18"
							max="99"
							placeholder="Min age"
							class="w-32 p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-10"
						/>
						<span class="text-gray-500 font-medium">to</span>
						<input
							type="number"
							bind:value={ageMax}
							min="18"
							max="99"
							placeholder="Max age"
							class="w-32 p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-10"
						/>
					</div>
				</div>
			</div>
		{:else}
			<div class="grid gap-6 mb-6">
				<div class="flex flex-col gap-2">
					<label for="group-name" class="font-semibold text-gray-700 text-sm uppercase tracking-wider">Group Name</label>
					<input
						type="text"
						id="group-name"
						bind:value={groupNameFilter}
						placeholder="Search by group name"
						class="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-10"
					/>
				</div>
			</div>
		{/if}

		<div class="flex gap-4 justify-center">
			<button 
				class="py-3 px-8 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed" 
				on:click={handleSearch} 
				disabled={isLoading}
			>
				{isLoading ? 'Searching...' : 'Search'}
			</button>
			<button 
				class="py-3 px-8 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 disabled:opacity-70 disabled:cursor-not-allowed" 
				on:click={resetFilters} 
				disabled={isLoading}
			> 
				Reset 
			</button>
		</div>

		{#if errorMessage}
			<div class="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mt-4 text-center">
				{errorMessage}
			</div>
		{/if}
	</div>

	{#if searchType === 'users' && searchResults.length > 0}
		<div class="mt-8">
			<h2 class="text-gray-700 mb-4 text-2xl">Search Results ({searchResults.length})</h2>
			<div class="grid gap-4">
				{#each searchResults as user (user.i)}
					<div class="bg-white rounded-xl p-6 border border-slate-200 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex justify-between items-start">
						<div class="flex-1">
							<h3 class="text-xl font-bold text-gray-800 mb-2">{user.t}</h3>
							<div class="flex gap-4 mb-3 text-sm text-gray-500">
								<span>Age: {user.a}</span>
								<span>
									{user.g === 0 ? 'Male' : 'Female'}
								</span>
							</div>
						</div>
						<div class="ml-4 flex gap-3 mt-4">
							<a href="/user/{user.i}" class="inline-block py-2 px-4 bg-blue-600 text-white no-underline rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-700 border-none cursor-pointer"> 
								View Profile 
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if searchType === 'groups' && groupResults.length > 0}
		<div class="mt-8">
			<h2 class="text-gray-700 mb-4 text-2xl">Group Results ({groupResults.length})</h2>
			<div class="grid gap-4">
				{#each groupResults as group (group.id)}
					<div class="bg-white rounded-xl p-6 border border-slate-200 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
						<div>
							<h3 class="text-xl font-bold text-gray-800 mb-2">{group.name}</h3>
							<div class="flex gap-4 mb-3 text-sm text-gray-500">
								<span>{group.memberCount || 0} members</span>
							</div>
						</div>

						<div class="mt-4">
							<DescriptionInput
								value={group.description || ''}
								editable={data.user?.isAdmin || data.user?.id === group.creatorId}
								autoUpdate={true}
								endpoint="/api/groups/update-description"
								rows={3}
								on:update={(e) => handleGroupDescriptionUpdate(group.id, e.detail.value)}
							/>
						</div>

						<div class="flex gap-3 mt-4">
							<a href="/groups/{group.id}" class="inline-block py-2 px-4 bg-blue-600 text-white no-underline rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-700 border-none cursor-pointer">
								View Group
							</a>
							{#if data.user?.isAdmin || data.user?.id === group.creatorId}
								<button class="inline-block py-2 px-4 bg-emerald-600 text-white no-underline rounded-md text-sm font-medium transition-colors duration-200 hover:bg-emerald-700 border-none cursor-pointer">
									Edit Group
								</button>
							{:else}
								<button class="inline-block py-2 px-4 bg-blue-600 text-white no-underline rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-700 border-none cursor-pointer">
									Join Group
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if !isLoading && ((searchType === 'users' && searchResults.length === 0 && (genderFilter !== null || ageMin !== 18 || ageMax !== 99)) || (searchType === 'groups' && groupResults.length === 0 && groupNameFilter))}
		<div class="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
			<p>No {searchType} found matching your criteria. Try adjusting your filters.</p>
		</div>
	{/if}
</div>