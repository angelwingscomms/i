<script lang="ts">
	import type { User } from '$lib/types';

	let { user }: { user: User | null | undefined } =
		$props();
</script>

<div class="mb-8 text-center">
	{#if user}
		<a href="/~/edit_user" class="btn-secondary btn-md">
			edit your profile
		</a>
	{:else}
		<a href="/~/edit_user" class="btn-primary btn-md">
			login w Google
		</a>
	{/if}
</div>
