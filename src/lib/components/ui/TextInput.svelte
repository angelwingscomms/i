<script lang="ts">
	let { value, placeholder = '', type = 'text' } = $props<{
		value: string;
		placeholder?: string;
		type?: string;
	}>();
</script>

<input
	type={type}
	bind:value
	{placeholder}
	class="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
/>