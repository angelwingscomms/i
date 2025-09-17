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
				goto(`/resume/${res.data}`)
			} else {
				const err = res.data;
				toast.error(err || 'Failed to create resume');
			}
		} catch (e) {
			toast.error('An error occurred');
		}
	}
</script>

<div class="max-w-[720px] mx-auto p-4">
	<h1 class="text-[22px] font-bold mb-4">Instantly create your resume with AI</h1>
	<DescriptionInput
		bind:value={txt}
		placeholder="Enter your work experience, education, skills, achievements, contact info, etc..."
		rows={10}
		label="Resume Content"
		editable={true}
	/>
	<button 
		class="w-full bg-[var(--btn-primary)] text-[var(--btn-text)] border border-[var(--border)] rounded-lg py-3 px-6 font-semibold cursor-pointer disabled:opacity-50" 
		onclick={createResume} 
		disabled={!txt.trim()}
	>
		Generate Resume
	</button>
</div>
