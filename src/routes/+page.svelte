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
	let ageMin = 13;
	let ageMax = 99;
	let searchResults: User[] = [];

	// Group search params
	let groupNameFilter = '';
	let groupResults: Group[] = [];

	// Description search params
	let descriptionMode: 'custom' | 'profile' = 'profile';
	let customDescription = '';

	let isLoading = false;
	let errorMessage = '';
	let hasSearched = false;

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
			hasSearched = true;
		}
	}

	function resetFilters() {
		if (searchType === 'users') {
			genderFilter = null;
			ageMin = 13;
			ageMax = 99;
			searchResults = [];
			customDescription = '';
			descriptionMode = 'profile';
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
		<!-- Intro Section -->
		<div class="mb-8 text-center">
			<h1 class="hero-title mb-4">Find common ground. Connect deeply.</h1>
			<p class="hero-subtitle">
				Share your interests, find meaningful matches, and build connections based on what truly
				matters.
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
											? option.value === null
												? 'choice-btn-active'
												: option.value === 0
													? 'choice-btn-active bg-blue-500 text-white'
													: 'choice-btn-active bg-red-500 text-white'
											: 'choice-btn-inactive'}
										style={genderFilter === option.value && option.value === null
											? 'background: var(--accent-purple); color: white;'
											: ''}
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
								min="13"
								max="99"
								placeholder="Min"
								class="age-input"
							/>
							<div class="age-divider"></div>
							<input
								type="number"
								bind:value={ageMax}
								min="13"
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
								{#each [{ mode: 'profile', label: 'My profile description' }, { mode: 'custom', label: 'Custom description' }] as option}
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
			} else if (!isLoading && hasSearched && ((searchType === 'users' && searchResults.length === 0)
			|| (searchType === 'groups' && groupResults.length === 0)))
			<div class="empty-state">
				<p class="text-secondary text-lg font-light">
					No {searchType} found matching your criteria. Try adjusting your filters.
				</p>
			</div>
		{/if}
	</div>
</main>
