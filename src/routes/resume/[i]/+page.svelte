<script lang="ts">
	let { data } = $props();
	let r = $state(data.r);
</script>

<div class="max-w-2xl mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Resume</h1>
	{#if r.h}
		<div class="bg-secondary rounded-lg p-4 mt-6">
			<iframe srcdoc={r.h} class="w-full h-[600px] border border-border rounded"></iframe>
		</div>
	{/if}
</div>