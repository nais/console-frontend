<script lang="ts">
	import { page } from '$app/state';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
	import DumbPageHeader from './PageHeader.svelte';

	const props = $derived(urlToPageHeader(page.url));
</script>

<div class="wrapper">
	<DumbPageHeader {...props} />
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
</style>
