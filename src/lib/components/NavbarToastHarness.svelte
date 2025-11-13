<script lang="ts">
	import { onMount } from 'svelte';
	import { addToast } from '$lib/util/toast.svelte';

	let {
		label = 'trigger toast',
		message = 'test toast'
	} = $props();

	function trigger_toast() {
		addToast(message, 'info', 1500);
	}

	onMount(() => {
		// noop to align with component pattern
	});
</script>

<button
	type="button"
	class="rounded bg-[var(--accent-primary)] px-4 py-2 text-white"
	onclick={trigger_toast}
>
	{label}
</button>
