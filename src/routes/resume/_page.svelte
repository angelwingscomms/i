<script lang="ts">
	import { goto } from '$app/navigation';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import { toast } from '$lib/util/toast';
	import axios from 'axios';
	import Button from '$lib/components/Button.svelte';

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
	<Button
		text="Generate Resume"
		on_click={createResume}
		wide={true}
		disabled={!txt.trim()}
	/>
	<div class="mt-4">
		<Button
			text="My Resumes"
			href="/resume/mine"
			wide={true}
		/>
	</div>
</div>
