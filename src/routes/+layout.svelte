<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children, data } = $props();
</script>

<Navbar user={data?.user} />
{@render children()}
