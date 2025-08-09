<script lang='ts'>
	import Chat from "$lib/components/Chat.svelte";
	import type { PageProps } from "./$types";
	const {data}: PageProps = $props()

</script>
<Chat m={data.m} s={data.s} c={data.c} t={data.t} />