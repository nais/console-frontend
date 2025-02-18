<script lang="ts">
	import { page } from '$app/state';
	import Deployments from '$lib/components/Deployments.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
	import type { PageData } from './$houdini';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { JobDeploys } = $derived(data);
</script>

<PageHeader {...urlToPageHeader(page.url)} />
<GraphErrors errors={$JobDeploys.errors} />

{#if $JobDeploys.data}
	<Deployments workload={$JobDeploys.data.team.environment.workload} />
{/if}
