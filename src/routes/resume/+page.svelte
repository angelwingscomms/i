<script lang="ts">
	import { goto } from '$app/navigation';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import { toast } from '$lib/util/toast';
	import axios from 'axios';

	let txt = $state('');

	async function createResume() {
		if (!txt.trim()) {
			toast.error('Please enter resume content');
			return;
		}
		try {
			const res = await axios.post('/resume', txt);
			if (res.statusText === 'OK') {
				toast.success('Resume created successfully');
				goto(`/resume/${res.data}`);
			} else {
				const err = res.data;
				toast.error(err || 'Failed to create resume');
			}
		} catch (e) {
			toast.error('An error occurred');
		}
	}
</script>

<div class="mx-auto max-w-[720px] p-4">
	<h1 class="mb-4 text-[22px] font-bold">
		Instantly create your resume with AI
	</h1>
	<DescriptionInput
		bind:value={txt}
		placeholder="Enter your work experience, education, skills, achievements, contact info, etc..."
		rows={10}
		label="Resume Content"
		editable={true}
	/>
	<button
		class="w-full cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--btn-primary)] px-6 py-3 font-semibold text-[var(--btn-text)] disabled:opacity-50"
		onclick={createResume}
		disabled={!txt.trim()}
	>
		Generate Resume
	</button>
</div>
