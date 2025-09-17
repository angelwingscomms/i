<script lang="ts">
	import { page } from '$app/state';
	import axios from 'axios';
	import DescriptionInput from '../ui/DescriptionInput.svelte';
	import { toast } from '$lib/util/toast';

	let {
		// mode,
		custom_description = $bindable(''),
	}: {
		mode?: 'profile' | 'custom';
		custom_description?: string;
	} = $props();

	let user_description = $derived(page.data.user?.d || '');

	let updateTimeout: NodeJS.Timeout;

	$effect(() => {
		if (user_description !== undefined) {
			clearTimeout(updateTimeout);
			updateTimeout = setTimeout(() => {
				axios.post('/edit_user', { description: user_description }).then(() => {
					console.log('pda')
					toast.success('Description updated!');
				}).catch((err) => {
					toast.error('Failed to update description.');
					console.error(err);
				});
			}, 1440); // 500ms throttle delay
		}
	});
</script>

<!-- {#if !page.data.user || mode === 'custom'}
	<div class="mt-3">
		<DescriptionInput
			label="what kind of person are you searching for?"
			bind:value={custom_description}
		/>
	</div>
{:else} -->
	<div class="mt-3">
		<DescriptionInput label="interests, beliefs, hobbies, stuff you like to talk about" bind:value={user_description} />
	</div>
<!-- {/if} -->
