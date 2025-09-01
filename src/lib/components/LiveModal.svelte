<script lang="ts">
	import Modal from './Modal.svelte';
	let { open = $bindable(), meeting } = $props();
	
</script>

<Modal bind:open>
	hii
	<rtk-meeting {meeting} id="my-meeting"></rtk-meeting>
</Modal>
