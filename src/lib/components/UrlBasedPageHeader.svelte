<script lang="ts">
	import { page } from '$app/state';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
	import DumbPageHeader from './PageHeader.svelte';

	const { breadcrumbs = [], heading } = $derived(urlToPageHeader(page.url));
</script>

<DumbPageHeader {breadcrumbs} {heading} />
