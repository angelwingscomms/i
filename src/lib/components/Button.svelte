<script lang="ts">
	let {
		on_click,
		text = '',
		loading = false,
		disabled = false,
		wide = false
	} = $props();
</script>

<button
	class="btn-primary {wide ? 'btn-wide' : ''}"
	onclick={on_click}
	disabled={loading || disabled}
>
	{#if loading}
		<i class="fas fa-spinner fa-spin"></i>
	{:else}
		{text}
	{/if}
</button>
