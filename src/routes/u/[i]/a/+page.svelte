<script lang="ts">
	import type { PageData } from './$types';

	let { c }: PageData = $props();
</script>

{#each c as chat}
	<a href="/r/{c.i}">{datetimestringwithdaymonthandyear(c.d)}</a>
{/each}
