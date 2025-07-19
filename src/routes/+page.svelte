<script lang="ts">
	import { page } from '$app/stores';
	import axios from 'axios';
	import type { User } from '$lib/types';

	export let data;

	let genderFilter: number | null = null; // 0 for male, 1 for female, null for all
	let ageMin = 18;
	let ageMax = 99;
	let searchResults: User[] = [];
	let isLoading = false;
	let errorMessage = '';

	async function handleSearch() {
		if (ageMin > ageMax) {
			errorMessage = 'Minimum age cannot be greater than maximum age';
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			const response = await axios.post('/api/search', {
				genderFilter,
				ageMin,
				ageMax
			});

			searchResults = response.data.users || [];
		} catch (error) {
			console.error('Search error:', error);
			errorMessage = 'An error occurred while searching. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function resetFilters() {
		genderFilter = null;
		ageMin = 18;
		ageMax = 99;
		searchResults = [];
		errorMessage = '';
	}
</script>

<div class="container">
	<header class="header">
		<h1>Find Your Match</h1>
		<p>Welcome back, {data.user?.t}!</p>
	</header>

	<div class="search-form">
		<div class="filters">
			<div class="filter-group">
				<label class="filter-label">Gender</label>
				<div class="radio-group">
					<label class="radio-label">
						<input type="radio" bind:group={genderFilter} value={null} />
						All
					</label>
					<label class="radio-label">
						<input type="radio" bind:group={genderFilter} value={0} />
						Male
					</label>
					<label class="radio-label">
						<input type="radio" bind:group={genderFilter} value={1} />
						Female
					</label>
				</div>
			</div>

			<div class="filter-group">
				<label class="filter-label">Age Range</label>
				<div class="age-inputs">
					<input
						type="number"
						bind:value={ageMin}
						min="18"
						max="99"
						placeholder="Min age"
						class="age-input"
					/>
					<span class="age-separator">to</span>
					<input
						type="number"
						bind:value={ageMax}
						min="18"
						max="99"
						placeholder="Max age"
						class="age-input"
					/>
				</div>
			</div>
		</div>

		<div class="action-buttons">
			<button class="search-btn" on:click={handleSearch} disabled={isLoading}>
				{isLoading ? 'Searching...' : 'Search'}
			</button>
			<button class="reset-btn" on:click={resetFilters} disabled={isLoading}> Reset </button>
		</div>

		{#if errorMessage}
			<div class="error-message">
				{errorMessage}
			</div>
		{/if}
	</div>

	{#if searchResults.length > 0}
		<div class="results">
			<h2>Search Results ({searchResults.length})</h2>
			<div class="user-list">
				{#each searchResults as user}
					<div class="user-card">
						<div class="user-info">
							<h3 class="user-tag">{user.t}</h3>
							<div class="user-details">
								<span class="user-age">Age: {user.a}</span>
								<span class="user-gender">
									{user.g === 0 ? 'Male' : 'Female'}
								</span>
							</div>
							<p class="user-description">
								{user.d.slice(0, 150)}{user.d.length > 150 ? '...' : ''}
							</p>
						</div>
						<div class="user-actions">
							<a href="/user/{user.i}" class="view-profile-btn"> View Profile </a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if !isLoading && searchResults.length === 0 && (genderFilter !== null || ageMin !== 18 || ageMax !== 99)}
		<div class="no-results">
			<p>No users found matching your criteria. Try adjusting your filters.</p>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header h1 {
		font-size: 2.5rem;
		color: #2563eb;
		margin-bottom: 0.5rem;
	}

	.header p {
		color: #6b7280;
		font-size: 1.1rem;
	}

	.search-form {
		background: #f8fafc;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
		border: 1px solid #e2e8f0;
	}

	.filters {
		display: grid;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-label {
		font-weight: 600;
		color: #374151;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.radio-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.95rem;
	}

	.radio-label input[type='radio'] {
		margin: 0;
	}

	.age-inputs {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.age-input {
		width: 120px;
		padding: 0.75rem;
		border: 2px solid #d1d5db;
		border-radius: 8px;
		font-size: 1rem;
	}

	.age-input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.age-separator {
		color: #6b7280;
		font-weight: 500;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.search-btn,
	.reset-btn {
		padding: 0.75rem 2rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.search-btn {
		background: #2563eb;
		color: white;
	}

	.search-btn:hover:not(:disabled) {
		background: #1d4ed8;
		transform: translateY(-1px);
	}

	.search-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.reset-btn {
		background: #f3f4f6;
		color: #374151;
		border: 2px solid #d1d5db;
	}

	.reset-btn:hover:not(:disabled) {
		background: #e5e7eb;
	}

	.error-message {
		background: #fef2f2;
		color: #dc2626;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #fecaca;
		margin-top: 1rem;
		text-align: center;
	}

	.results {
		margin-top: 2rem;
	}

	.results h2 {
		color: #374151;
		margin-bottom: 1rem;
		font-size: 1.5rem;
	}

	.user-list {
		display: grid;
		gap: 1rem;
	}

	.user-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		transition: all 0.2s;
	}

	.user-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.user-info {
		flex: 1;
	}

	.user-tag {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.user-details {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.75rem;
		font-size: 0.9rem;
		color: #6b7280;
	}

	.user-description {
		color: #4b5563;
		line-height: 1.5;
		margin: 0;
	}

	.user-actions {
		margin-left: 1rem;
	}

	.view-profile-btn {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: #2563eb;
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	.view-profile-btn:hover {
		background: #1d4ed8;
	}

	.no-results {
		text-align: center;
		padding: 3rem 1rem;
		color: #6b7280;
	}

	@media (max-width: 640px) {
		.container {
			padding: 1rem 0.5rem;
		}

		.search-form {
			padding: 1.5rem;
		}

		.age-inputs {
			flex-direction: column;
			align-items: flex-start;
		}

		.age-input {
			width: 100%;
		}

		.action-buttons {
			flex-direction: column;
		}

		.user-card {
			flex-direction: column;
			gap: 1rem;
		}

		.user-actions {
			margin-left: 0;
		}
	}
</style>
