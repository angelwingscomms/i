<script lang="ts">
	import { countries } from '$lib/constants';

	let {
		value = '',
		id = '',
		name = '',
		required = false,
		disabled = false,
		placeholder = 'Enter your phone number',
		formatAsWhatsAppLink = false,
		onChange,
		onInput
	}: {
		value?: string;
		id?: string;
		name?: string;
		required?: boolean;
		disabled?: boolean;
		placeholder?: string;
		formatAsWhatsAppLink?: boolean;
		onChange?: (detail: any) => void;
		onInput?: (detail: any) => void;
	} = $props();

	let selectedCountryCode = '+1';
	let localNumber = '';
	let isDropdownOpen = false;
	let dropdownRef: HTMLDivElement;
	let inputRef: HTMLInputElement;
	let error = '';
	let success = '';

	$effect(() => {
		// Update the combined value when components change
		if (localNumber) {
			const rawNumber =
				selectedCountryCode +
				localNumber.replace(/\D/g, '');
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
	});

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}

	function selectCountry(code: string) {
		selectedCountryCode = code;
		isDropdownOpen = false;
		validatePhoneNumber();
		onChange?.({ value });
		inputRef.focus();
	}

	function handleLocalNumberInput(event: Event) {
		const target = event.target as HTMLInputElement;
		// Only allow numbers, spaces, parentheses, hyphens
		localNumber = target.value.replace(
			/[^\d\s\(\)\-]/g,
			''
		);
		validatePhoneNumber();
		onInput?.({ value });
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
		if (
			dropdownRef &&
			!dropdownRef.contains(event.target as Node)
		) {
			isDropdownOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="phone-input-container">
	<div class="flex w-full">
		<div class="relative" bind:this={dropdownRef}>
			<button
				type="button"
				class="hover:bg-glass flex h-full items-center rounded-l-lg border-r-0 px-3 py-3 transition-all duration-200"
				style="border: 2px solid var(--border-secondary); background: var(--bg-input);"
				onclick={toggleDropdown}
			>
				<span class="mr-2 text-lg"
					>{countries.find(
						(c) => c.code === selectedCountryCode
					)?.flag || '🌐'}</span
				>
				<span class="text-primary mr-2 font-semibold"
					>{selectedCountryCode}</span
				>
				<svg
					class="opacity-60"
					width="10"
					height="6"
					viewBox="0 0 10 6"
					fill="currentColor"
				>
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
				<div
					class="absolute top-full left-0 z-50 mt-1 max-h-80 w-80 overflow-y-auto rounded-lg backdrop-blur-lg"
					style="background: var(--bg-card); border: 2px solid var(--border-secondary); box-shadow: var(--shadow-lg);"
				>
					{#each countries as country}
						<button
							type="button"
							class="hover:bg-glass flex w-full items-center border-none bg-transparent p-3 text-left transition-all duration-200 {selectedCountryCode ===
							country.code
								? 'bg-glass-hover'
								: ''}"
							onclick={() =>
								selectCountry(country.code)}
						>
							<span class="mr-3 text-lg"
								>{country.flag}</span
							>
							<span
								class="text-primary flex-1 text-sm"
								>{country.name}</span
							>
							<span
								class="text-secondary text-sm font-semibold"
								>{country.code}</span
							>
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
			class="flex-1 rounded-r-lg px-3 py-3 transition-all duration-300 focus:outline-none {error
				? 'border-error'
				: ''}"
			style="border: 2px solid var(--border-secondary); background: var(--bg-input); color: var(--text-primary); border-left: none;"
			{placeholder}
			{disabled}
			{required}
			oninput={handleLocalNumberInput}
		/>
	</div>

	{#if error}
		<div class="error-card mt-2">{error}</div>
	{/if}

	{#if success}
		<div class="success-card mt-2">{success}</div>
	{/if}

	{#if formatAsWhatsAppLink && value}
		<div class="text-tertiary mt-2 text-xs">
			<small
				>WhatsApp Link: <a
					href={value}
					target="_blank"
					rel="noopener noreferrer"
					class="text-accent hover:underline"
					>{value}</a
				></small
			>
		</div>
	{/if}

	<input type="hidden" {name} {value} />
</div>

<style>
	.border-error {
		border-color: var(--text-error) !important;
	}

	@media (max-width: 640px) {
		.w-80 {
			width: 250px;
		}
	}
</style>
