<script lang="ts">
	let { data } = $props();
	let r = $state(data.r);
</script>

<div class="mx-auto max-w-2xl p-4">
	<h1 class="mb-4 text-2xl font-bold">Resume</h1>
	{#if r.h}
		<div class="bg-secondary mt-6 rounded-lg p-4">
			<iframe
				srcdoc={r.h}
				class="border-border h-[600px] w-full rounded border"
			></iframe>
		</div>
	{/if}
</div>
