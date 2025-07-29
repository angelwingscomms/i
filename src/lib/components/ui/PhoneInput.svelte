<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { countries } from '$lib/constants';

	export let value = '';
	export let id = '';
	export let name = '';
	export let required = false;
	export let disabled = false;
	export let placeholder = 'Enter your phone number';
	export let error = '';
	export let success = '';
	export let formatAsWhatsAppLink = false;

	let selectedCountryCode = '+1';
	let localNumber = '';
	let isDropdownOpen = false;
	let dropdownRef: HTMLDivElement;
	let inputRef: HTMLInputElement;

	$: {
		// Update the combined value when components change
		if (localNumber) {
			const rawNumber = selectedCountryCode + localNumber.replace(/\D/g, '');
			if (formatAsWhatsAppLink) {
				// Format as WhatsApp link
				value = `https://wa.me/${rawNumber.substring(1)}`; // Remove the + sign
			} else {
				// Format as E.164 (e.g., +1234567890)
				value = rawNumber;
			}
		} else {
			value = '';
		}
	}

	const dispatch = createEventDispatcher();

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}

	function selectCountry(code: string) {
		selectedCountryCode = code;
		isDropdownOpen = false;
		validatePhoneNumber();
		dispatch('change', { value });
		inputRef.focus();
	}

	function handleLocalNumberInput(event: Event) {
		const target = event.target as HTMLInputElement;
		// Only allow numbers, spaces, parentheses, hyphens
		localNumber = target.value.replace(/[^\d\s\(\)\-]/g, '');
		validatePhoneNumber();
		dispatch('input', { value });
	}

	// function handleBlur() {
	// 	setTimeout(() => {
	// 		isDropdownOpen = false;
	// 	}, 200);
	// 	validatePhoneNumber();
	// 	dispatch('blur', { value });
	// }

	function validatePhoneNumber() {
		const rawNumber = localNumber.replace(/\D/g, '');
		if (required && !rawNumber) {
			error = 'Phone number is required';
			return false;
		}

		if (rawNumber && rawNumber.length < 5) {
			error = 'Phone number is too short';
			return false;
		}

		error = '';
		return true;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isDropdownOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="phone-input-container">
	<div class="input-group">
		<div class="country-code-dropdown" bind:this={dropdownRef}>
			<button type="button" class="dropdown-toggle" on:click={toggleDropdown}>
				<span class="country-flag"
					>{countries.find((c) => c.code === selectedCountryCode)?.flag || '🌐'}</span
				>
				<span class="country-code">{selectedCountryCode}</span>
				<svg class="dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
					<path
						d="M1 1L5 5L9 1"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>

			{#if isDropdownOpen}
				<div class="dropdown-menu">
					{#each countries as country}
						<button
							type="button"
							class="country-option {selectedCountryCode === country.code ? 'selected' : ''}"
							on:click={() => selectCountry(country.code)}
						>
							<span class="country-flag">{country.flag}</span>
							<span class="country-name">{country.name}</span>
							<span class="country-code">{country.code}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<input
			type="tel"
			{id}
			{name}
			bind:value={localNumber}
			bind:this={inputRef}
			class="phone-number-input {error ? 'error' : ''}"
			{placeholder}
			{disabled}
			{required}
			on:input={handleLocalNumberInput}
			on:blur={handleBlur}
		/>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	{#if success}
		<div class="success-message">{success}</div>
	{/if}

	{#if formatAsWhatsAppLink && value}
		<div class="format-preview">
			<small
				>WhatsApp Link: <a href={value} target="_blank" rel="noopener noreferrer">{value}</a></small
			>
		</div>
	{/if}

	<input type="hidden" {name} {value} />
</div>

<style>
	.phone-input-container {
		width: 100%;
	}

	.input-group {
		display: flex;
		align-items: stretch;
		width: 100%;
	}

	.country-code-dropdown {
		position: relative;
	}

	.dropdown-toggle {
		display: flex;
		align-items: center;
		padding: 0.75rem;
		border: 2px solid #d1d5db;
		border-right: none;
		border-radius: 8px 0 0 8px;
		background: white;
		cursor: pointer;
		transition: border-color 0.2s;
		height: 100%;
	}

	.dropdown-toggle:hover {
		background: #f8fafc;
	}

	.country-flag {
		margin-right: 6px;
		font-size: 1.2rem;
	}

	.country-code {
		font-weight: 600;
		margin-right: 6px;
	}

	.dropdown-arrow {
		opacity: 0.6;
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 50;
		width: 300px;
		max-height: 300px;
		overflow-y: auto;
		background: white;
		border: 2px solid #d1d5db;
		border-radius: 8px;
		margin-top: 4px;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.country-option {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0.75rem;
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
		transition: background 0.2s;
	}

	.country-option:hover {
		background: #f8fafc;
	}

	.country-option.selected {
		background: #dbeafe;
	}

	.country-name {
		flex: 1;
		margin: 0 10px;
		font-size: 0.9rem;
	}

	.phone-number-input {
		flex: 1;
		padding: 0.75rem;
		border: 2px solid #d1d5db;
		border-radius: 0 8px 8px 0;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.phone-number-input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.phone-number-input.error {
		border-color: #dc2626;
	}

	.error-message {
		color: #dc2626;
		font-size: 0.85rem;
		margin-top: 0.5rem;
	}

	.success-message {
		color: #16a34a;
		font-size: 0.85rem;
		margin-top: 0.5rem;
	}

	.format-preview {
		margin-top: 0.5rem;
		font-size: 0.85rem;
		color: #6b7280;
	}

	.format-preview a {
		color: #2563eb;
		text-decoration: none;
	}

	.format-preview a:hover {
		text-decoration: underline;
	}

	@media (max-width: 640px) {
		.dropdown-menu {
			width: 250px;
		}
	}
</style>
