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
	let { JobManifest } = $derived(data);
</script>

<PageHeader {...urlToPageHeader(page.url)} />

<GraphErrors errors={$JobManifest.errors} />

{#if $JobManifest.data}
	<Manifest workload={$JobManifest.data.team.environment.job} />
{/if}
