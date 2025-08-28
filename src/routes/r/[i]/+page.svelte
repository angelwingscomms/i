<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import type { PageProps } from './$types';
	const { data }: PageProps = $props();
</script>

<Chat s={data.s} m={data.m} t={data.t} c={data.c} _={data._} a={data.a} />
