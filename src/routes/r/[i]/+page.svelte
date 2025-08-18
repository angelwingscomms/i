<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import type { PageProps } from './$types';
	const {data}: PageProps = $props()
</script>

<Chat s={data.s} m={data.m} t={data.c} c={data.c} r={true} a={true} />

