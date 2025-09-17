<script lang="ts">
	import { page } from '$app/state';
	let {
		mode = $bindable('custom')
	}: { mode: 'profile' | 'custom' } = $props();
</script>

{#if page.data.user}
	<div class="choice-group">
		<button
			class={mode === 'profile'
				? 'choice-btn-active'
				: 'choice-btn-inactive'}
			onclick={() => (mode = 'profile')}
			>search for users similar to you</button
		>
		<button
			class={mode === 'custom'
				? 'choice-btn-active'
				: 'choice-btn-inactive'}
			onclick={() => (mode = 'custom')}
			>custom search</button
		>
	</div>
{/if}
