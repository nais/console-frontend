<script lang="ts">
	import { page } from '$app/state';
	import Manifest from '$lib/components/Manifest.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { AppManifest } = $derived(data);
</script>

<PageHeader {...urlToPageHeader(page.url)} />
<GraphErrors errors={$AppManifest.errors} />

{#if $AppManifest.data}
	<Manifest workload={$AppManifest.data.team.environment.application} />
{/if}
