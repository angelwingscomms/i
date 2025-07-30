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

	// Description search params
	let descriptionMode: 'custom' | 'profile' = 'custom'; // Default to custom
	let customDescription = '';

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
				let descriptionPayload: string | undefined = undefined;

				if (!data.user) {
					// If user is not logged in, always use custom input
					descriptionPayload = customDescription;
				} else if (descriptionMode === 'custom') {
					// If logged in and custom mode selected
					descriptionPayload = customDescription;
				} else if (descriptionMode === 'profile') {
					// If logged in and profile mode selected, use user's profile description
					descriptionPayload = data.user?.description;
				}

				const searchPayload: Record<string, any> = {
					g: genderFilter,
					n: ageMin,
					x: ageMax
				};

				if (descriptionPayload) {
					searchPayload.D = descriptionPayload;
				}

				const response = await axios.post('/search', searchPayload);

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
			customDescription = ''; // Reset custom description
			descriptionMode = 'custom'; // Reset description mode
		} else {
			groupNameFilter = '';
			groupResults = [];
		}
		errorMessage = '';
	}

	function handleGroupDescriptionUpdate(groupId: string, newDescription: string) {
		// Update local state after successful update
		groupResults = groupResults.map((group) =>
			group.id === groupId ? { ...group, description: newDescription } : group
		);
	}

	function toggleSearchType(type: 'users' | 'groups') {
		searchType = type;
		resetFilters();
	}
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
	<header class="mb-6 text-center">
		<h1 class="mb-2 text-4xl text-blue-600">Find Your Match</h1>
		<p class="text-lg text-gray-500">Welcome back, {data.user?.t}!</p>
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

	<div class="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-8">
		{#if searchType === 'users'}
			<div class="mb-6 grid gap-6">
				<div class="flex flex-col gap-2">
					<label
						for="gender-filter"
						class="text-sm font-semibold tracking-wider text-gray-700 uppercase">Gender</label
					>
					<div class="flex flex-wrap gap-4">
						<label class="flex cursor-pointer items-center gap-2 text-base">
							<input type="radio" id="gender-filter" bind:group={genderFilter} value={null} />
							All
						</label>
						<label class="flex cursor-pointer items-center gap-2 text-base">
							<input type="radio" bind:group={genderFilter} value={0} />
							Male
						</label>
						<label class="flex cursor-pointer items-center gap-2 text-base">
							<input type="radio" bind:group={genderFilter} value={1} />
							Female
						</label>
					</div>
				</div>

				<div class="flex flex-col gap-2">
					<label for="age-min" class="text-sm font-semibold tracking-wider text-gray-700 uppercase"
						>Age Range</label
					>
					<div class="flex flex-wrap items-center gap-4">
						<input
							type="number"
							id="age-min"
							bind:value={ageMin}
							min="18"
							max="99"
							placeholder="Min age"
							class="focus:ring-opacity-10 w-32 rounded-lg border-2 border-gray-300 p-3 text-base focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
						/>
						<span class="font-medium text-gray-500">to</span>
						<input
							type="number"
							bind:value={ageMax}
							min="18"
							max="99"
							placeholder="Max age"
							class="focus:ring-opacity-10 w-32 rounded-lg border-2 border-gray-300 p-3 text-base focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
						/>
					</div>
				</div>

				<!-- Description Search Section -->
				{#if data.user}
					<div class="flex flex-col gap-2">
						<label class="text-sm font-semibold tracking-wider text-gray-700 uppercase"
							>Description Search Mode</label
						>
						<div class="flex flex-wrap gap-4">
							<button
								class="flex cursor-pointer items-center gap-2 rounded-lg border-2 bg-white px-4 py-2 text-sm font-semibold transition-all duration-200 {descriptionMode ===
								'custom'
									? 'border-blue-600 bg-blue-600 text-white'
									: 'border-gray-300 text-gray-500 hover:border-blue-600 hover:text-blue-600'}"
								on:click={() => (descriptionMode = 'custom')}
							>
								Search with custom description
							</button>
							<button
								class="flex cursor-pointer items-center gap-2 rounded-lg border-2 bg-white px-4 py-2 text-sm font-semibold transition-all duration-200 {descriptionMode ===
								'profile'
									? 'border-blue-600 bg-blue-600 text-white'
									: 'border-gray-300 text-gray-500 hover:border-blue-600 hover:text-blue-600'}"
								on:click={() => (descriptionMode = 'profile')}
							>
								Use my profile description
							</button>
						</div>
					</div>
				{/if}

				{#if !data.user || (data.user && descriptionMode === 'custom')}
					<div class="flex flex-col gap-2">
						<label
							for="custom-description"
							class="text-sm font-semibold tracking-wider text-gray-700 uppercase"
							>Type or record a description of yourself or the kind of person you're looking for</label
						>
						<DescriptionInput
							id="custom-description"
							bind:value={customDescription}
							rows={4}
							editable={true}
							autoUpdate={false}
						/>
					</div>
				{/if}
			</div>
		{:else}
			<div class="mb-6 grid gap-6">
				<div class="flex flex-col gap-2">
					<label
						for="group-name"
						class="text-sm font-semibold tracking-wider text-gray-700 uppercase">Group Name</label
					>
					<input
						type="text"
						id="group-name"
						bind:value={groupNameFilter}
						placeholder="Search by group name"
						class="focus:ring-opacity-10 w-full rounded-lg border-2 border-gray-300 p-3 text-base transition-colors duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>
			</div>
		{/if}

		<div class="flex justify-center gap-4">
			<button
				class="cursor-pointer rounded-lg border-none bg-blue-600 px-8 py-3 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
				on:click={handleSearch}
				disabled={isLoading}
			>
				{isLoading ? 'Searching...' : 'Search'}
			</button>
			<button
				class="cursor-pointer rounded-lg border-2 border-gray-300 bg-gray-100 px-8 py-3 text-base font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-70"
				on:click={resetFilters}
				disabled={isLoading}
			>
				Reset
			</button>
		</div>

		{#if errorMessage}
			<div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
				{errorMessage}
			</div>
		{/if}
	</div>

	{#if searchType === 'users' && searchResults.length > 0}
		<div class="mt-8">
			<h2 class="mb-4 text-2xl text-gray-700">Search Results ({searchResults.length})</h2>
			<div class="grid gap-4">
				{#each searchResults as user (user.i)}
					<div
						class="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
					>
						<div class="flex-1">
							<h3 class="mb-2 text-xl font-bold text-gray-800">{user.t}</h3>
							<div class="mb-3 flex gap-4 text-sm text-gray-500">
								<span>Age: {user.a}</span>
								<span>
									{user.g === 0 ? 'Male' : 'Female'}
								</span>
							</div>
						</div>
						<div class="mt-4 ml-4 flex gap-3">
							<a
								href="/user/{user.i}"
								class="inline-block cursor-pointer rounded-md border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-blue-700"
							>
								View Profile
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if searchType === 'groups' && groupResults.length > 0}
		<div class="mt-8">
			<h2 class="mb-4 text-2xl text-gray-700">Group Results ({groupResults.length})</h2>
			<div class="grid gap-4">
				{#each groupResults as group (group.id)}
					<div
						class="rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
					>
						<div>
							<h3 class="mb-2 text-xl font-bold text-gray-800">{group.name}</h3>
							<div class="mb-3 flex gap-4 text-sm text-gray-500">
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

						<div class="mt-4 flex gap-3">
							<a
								href="/groups/{group.id}"
								class="inline-block cursor-pointer rounded-md border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-blue-700"
							>
								View Group
							</a>
							{#if data.user?.isAdmin || data.user?.id === group.creatorId}
								<button
									class="inline-block cursor-pointer rounded-md border-none bg-emerald-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-emerald-700"
								>
									Edit Group
								</button>
							{:else}
								<button
									class="inline-block cursor-pointer rounded-md border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-blue-700"
								>
									Join Group
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if !isLoading && ((searchType === 'users' && searchResults.length === 0 && (genderFilter !== null || ageMin !== 18 || ageMax !== 99)) || (searchType === 'groups' && groupResults.length === 0 && groupNameFilter))}
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
			<p>No {searchType} found matching your criteria. Try adjusting your filters.</p>
		</div>
	{/if}
</div>
