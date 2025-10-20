<script lang="ts">
	import { page } from '$app/state';
	import axios from 'axios';
	import { toast } from '$lib/util/toast.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import type { ResourceName } from '$lib/types/resource_name.js';
	let { data } = $props(),
		r: ResourceName = data.r;

	let loading = $state(false);

	async function set(e: SubmitEvent) {
		e.preventDefault();
		if (!r.t.trim()) return;
		loading = true;
		try {
			await axios.put(`/resource_name/${r.i}`, {
				t: r.t,
				d: r.d
			});
			toast('resource updated');
		} catch (e) {
			console.error(e.response?.data || e.message);
		} finally {
			loading = false;
		}
	}
</script>

{#if page.data.user.i === r.u}
	<form onsubmit={set}>
		<DescriptionInput
			bind:value={r.t}
			placeholder="title"
		/>
		<DescriptionInput
			bind:value={r.d}
			placeholder="about the resource"
			rows={3}
		/>
		<Button
			{loading}
			disabled={!r.t.trim()}
			text="update"
			icon="fa-save"
		/>
	</form>
{/if}
