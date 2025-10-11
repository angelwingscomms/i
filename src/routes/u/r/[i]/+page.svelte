<script lang="ts">
	import { page } from '$app/state';
	import Chat from '$lib/components/Chat.svelte';
	import type { PageProps } from './$types';
	const { data }: PageProps = $props();
	console.log('data', data);
</script>

<Chat
	authToken={data.q}
	m={data.m}
	i={page.params.i!!}
	t={data.t}
	r={data.r}
	_={data._}
	a={data.a}
/>
