<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';

	let {
		query = $bindable(''),
		selected_date = $bindable<string | null>(null),
		searching = $bindable(false),
		onsearch = $bindable(
			(date: string | null) => {}
		)
	} = $props();

	const clear_date = () => {
		selected_date = null;
		onsearch(selected_date);
	};

	const change_date = (event: Event) => {
		const target = event.target as HTMLInputElement;
		selected_date = target.value || null;
		onsearch(selected_date);
	};

	const submit = (event: Event) => {
		event.preventDefault();
		onsearch(selected_date);
	};
</script>

<form class="space-y-4" onsubmit={submit}>
	<div>
		<label
			for="diary-search-input"
			class="mb-2 block text-sm font-semibold [color:var(--color-theme-4)]"
		>
			search
		</label>
	<DescriptionInput
		id="diary-search-input"
		bind:value={query}
		placeholder="search diary entries..."
		send={() => onsearch(selected_date)}
		send_loading={searching}
		label=""
		voice_typing={true}
		ontranscribe={() => {}}
	/>
	</div>

	<div class="flex items-center gap-3">
		<div class="flex-1">
			<label
				for="diary-search-date"
				class="mb-2 block text-sm font-semibold [color:var(--color-theme-4)]"
			>
				date
			</label>
			<input
				type="date"
				id="diary-search-date"
				value={selected_date ?? ''}
				onchange={change_date}
				class="w-full rounded border border-[var(--color-theme-6)] bg-transparent px-3 py-2 text-sm text-[var(--color-theme-4)]"
			/>
		</div>
		{#if selected_date}
			<Button
				type="button"
				text="clear"
				onclick={clear_date}
				variant="ghost"
			/>
		{/if}
	</div>

	<Button text="search" type="submit" wide={true} icon={searching ? 'fa-spinner fa-spin' : ''} />
</form>
