<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/Card.svelte';
	import Deployments from '$lib/components/Deployments.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
	import type { PageData } from './$houdini';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { AppDeploys } = $derived(data);
</script>

<PageHeader {...urlToPageHeader(page.url)} />

<GraphErrors errors={$AppDeploys.errors} />

{#if $AppDeploys.data}
	<Card>
		<Deployments workload={$AppDeploys.data.team.environment.workload} />
	</Card>
{/if}
