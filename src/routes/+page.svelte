<script lang="ts">
	import axios from 'axios';
	import type { User, Group } from '$lib/types';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import { type PageData } from './$types';
	import { browser } from '$app/environment';

	export let data: PageData;

	let searchType: 'users' | 'groups' = 'users';

	// User search params
	let genderFilter: number | null = null;
	let ageMin = 18;
	let ageMax = 99;
	let searchResults: User[] = [];

	// Group search params
	let groupNameFilter = '';
	let groupResults: Group[] = [];

	// Description search params
	let descriptionMode: 'custom' | 'profile' = 'custom';
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
					descriptionPayload = customDescription;
				} else if (descriptionMode === 'custom') {
					descriptionPayload = customDescription;
				} else if (descriptionMode === 'profile') {
					descriptionPayload = data.user?.d;
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
			customDescription = '';
			descriptionMode = 'custom';
		} else {
			groupNameFilter = '';
			groupResults = [];
		}
		errorMessage = '';
	}

	function handleGroupDescriptionUpdate(groupId: string, newDescription: string) {
		groupResults = groupResults.map((group) =>
			group.id === groupId ? { ...group, description: newDescription } : group
		);
	}

	function toggleSearchType(type: 'users' | 'groups') {
		searchType = type;
		resetFilters();
	}

	async function copyProfileLink() {
		if (!data.user?.i) return;

		const profileLink = `${window.location.origin}/user/${data.user.i}`;

		try {
			await navigator.clipboard.writeText(profileLink);
			alert('profile link copied');
		} catch (err) {
			console.error('Failed to copy profile link:', err);
			alert('Failed to copy link.');
		}
	}
</script>

<main>
	<!-- Background elements -->
	<div class="bg-orb bg-orb-1"></div>
	<div class="bg-orb bg-orb-2"></div>
	<div class="bg-orb bg-orb-3"></div>

	<div class="container-main min-h-screen py-8">
		<!-- Hero Section -->
		<div class="mb-8 text-center">
			<h1 class="hero-title mb-4">quickly find what you have in common with other people</h1>
			<p class="hero-subtitle">
				describe yourself, your beliefs, your passions, and stuff you like to do or talk about, with
				a text or a voice note. Our AI compares profiles privately, showing only what you have in
				common with other. Feel free to be open—your full details stay private
			</p>
		</div>

		<!-- Authentication -->
		<div class="mb-8 text-center">
			{#if data.user}
				<a href="/edit_user" class="btn-secondary btn-md"> edit your profile </a>
			{:else}
				<a href="/edit_user" class="btn-primary btn-md"> login w Google </a>
			{/if}
		</div>

		<!-- Profile Share Section -->
		{#if data.user && browser}
			<div class="container-narrow mb-8">
				<div class="card-normal">
					<p class="text-secondary mb-4 text-center">
						Share your profile with others so they can see what they have in common with you.
					</p>
					<div class="flex items-center gap-3">
						<div class="glass text-primary flex-1 truncate rounded-lg px-4 py-3 font-mono text-sm">
							{window.location.origin}/user/{data.user.i}
						</div>
						<button on:click={copyProfileLink} class="btn-accent btn-sm"> Copy </button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Welcome Header -->
		<div class="mb-6 text-center">
			<h2 class="text-accent mb-2 text-3xl font-light">Find Your Match</h2>
			{#if data.user}
				<p class="text-secondary text-lg">Welcome back, {data.user?.t}!</p>
			{/if}
		</div>

		<!-- Search Type Toggle -->
		<div class="mb-6 flex justify-center">
			<div class="toggle-group">
				<button
					class={searchType === 'users' ? 'toggle-btn-active' : 'toggle-btn-inactive'}
					style={searchType === 'users' ? 'background: var(--accent-blue);' : ''}
					on:click={() => toggleSearchType('users')}
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
						/>
					</svg>
					Users
				</button>
				<button
					class={searchType === 'groups' ? 'toggle-btn-active' : 'toggle-btn-inactive'}
					style={searchType === 'groups' ? 'background: var(--accent-purple);' : ''}
					on:click={() => toggleSearchType('groups')}
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"
						/>
					</svg>
					Groups
				</button>
			</div>
		</div>

		<!-- Search Form -->
		<div class="card-normal mb-6">
			{#if searchType === 'users'}
				<div class="section-spacing">
					<!-- Gender Filter -->
					<div class="form-group">
						<label class="form-label">Gender</label>
						<div class="choice-group">
							{#each [{ value: null, label: 'All' }, { value: 0, label: 'Male' }, { value: 1, label: 'Female' }] as option}
								<label>
									<input
										type="radio"
										bind:group={genderFilter}
										value={option.value}
										class="sr-only"
									/>
									<div
										class={genderFilter === option.value
											? 'choice-btn-active'
											: 'choice-btn-inactive'}
									>
										{option.label}
									</div>
								</label>
							{/each}
						</div>
					</div>

					<!-- Age Range -->
					<div class="form-group">
						<label class="form-label">Age Range</label>
						<div class="age-range-container">
							<input
								type="number"
								bind:value={ageMin}
								min="18"
								max="99"
								placeholder="Min"
								class="age-input"
							/>
							<div class="age-divider"></div>
							<input
								type="number"
								bind:value={ageMax}
								min="18"
								max="99"
								placeholder="Max"
								class="age-input"
							/>
						</div>
					</div>

					<!-- Description Mode -->
					{#if data.user}
						<div class="form-group">
							<label class="form-label">Description Search Mode</label>
							<div class="choice-group">
								{#each [{ mode: 'custom', label: 'Custom description' }, { mode: 'profile', label: 'My profile description' }] as option}
									<button
										class={descriptionMode === option.mode
											? 'choice-btn-active'
											: 'choice-btn-inactive'}
										on:click={() => (descriptionMode = option.mode)}
									>
										{option.label}
									</button>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Description Input -->
					{#if !data.user || (data.user && descriptionMode === 'custom')}
						<div class="form-group">
							<label class="form-label">
								Type or record a description of yourself or the kind of person you're looking for
							</label>
							<div class="glass p-1">
								<DescriptionInput
									bind:value={customDescription}
									rows={3}
									editable={true}
									autoUpdate={false}
								/>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Group Search -->
				<div class="form-group">
					<label class="form-label">Group Name</label>
					<input
						type="text"
						bind:value={groupNameFilter}
						placeholder="Search by group name"
						class="input-rounded w-full"
					/>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="mt-6 flex justify-center gap-4">
				<button class="btn-primary btn-md" on:click={handleSearch} disabled={isLoading}>
					{#if isLoading}
						<div class="loading-spinner"></div>
						Searching...
					{:else}
						Search
					{/if}
				</button>
				<button class="btn-ghost btn-md" on:click={resetFilters} disabled={isLoading}>
					Reset
				</button>
			</div>

			<!-- Error Message -->
			{#if errorMessage}
				<div class="error-card mt-4">
					{errorMessage}
				</div>
			{/if}
		</div>

		<!-- Results Section -->
		{#if searchType === 'users' && searchResults.length > 0}
			<div class="section-spacing-lg">
				<h2 class="text-accent mb-4 text-center text-2xl font-light">
					Search Results ({searchResults.length})
				</h2>
				<div class="grid gap-4 md:grid-cols-2">
					{#each searchResults as user (user.i)}
						<div class="result-card">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<h3 class="result-title">{user.t}</h3>
									<div class="result-meta mt-2">
										<span>Age: {user.a}</span>
										<span>{user.g === 0 ? 'Male' : 'Female'}</span>
									</div>
								</div>
								<div class="ml-4">
									<a href="/user/{user.i}" class="btn-primary btn-sm"> View Profile </a>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if searchType === 'groups' && groupResults.length > 0}
			<div class="section-spacing-lg">
				<h2 class="text-accent mb-4 text-center text-2xl font-light">
					Group Results ({groupResults.length})
				</h2>
				<div class="section-spacing">
					{#each groupResults as group (group.id)}
						<div class="result-card">
							<div class="section-spacing-sm">
								<div>
									<h3 class="result-title">{group.name}</h3>
									<div class="result-meta mt-1">
										<span>{group.memberCount || 0} members</span>
									</div>
								</div>

								<div class="glass rounded-lg p-1">
									<DescriptionInput
										value={group.description || ''}
										editable={data.user?.isAdmin || data.user?.i === group.creatorId}
										autoUpdate={true}
										endpoint="/api/groups/update-description"
										rows={2}
										on:update={(e) => handleGroupDescriptionUpdate(group.id, e.detail.value)}
									/>
								</div>

								<div class="flex flex-wrap gap-3">
									<a href="/groups/{group.id}" class="btn-accent btn-sm"> View Group </a>
									{#if data.user?.isAdmin || data.user?.i === group.creatorId}
										<button class="btn-secondary btn-sm"> Edit Group </button>
									{:else}
										<button class="btn-primary btn-sm"> Join Group </button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if !isLoading && ((searchType === 'users' && searchResults.length === 0 && (genderFilter !== null || ageMin !== 18 || ageMax !== 99 || customDescription !== '')) || (searchType === 'groups' && groupResults.length === 0 && groupNameFilter))}
			<div class="empty-state">
				<p class="text-secondary text-lg font-light">
					No {searchType} found matching your criteria. Try adjusting your filters.
				</p>
			</div>
		{/if}
	</div>
</main>
