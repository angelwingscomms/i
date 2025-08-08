<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<Chat m={data.m} c={data.c} s={data.s} t={data.t} />
