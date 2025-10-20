<script lang="ts">
	import Resume from '$lib/components/resume/Resume/Resume.svelte';
	let { data } = $props();
</script>

<Resume {data} />
