<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import type { PageProps } from './$types';
	const { data }: PageProps = $props();
	console.log('data', data);
</script>

<Chat authToken={data.q} s={data.s} m={data.m} t={data.t} r={data.r} _={data._} a={data.a} />
