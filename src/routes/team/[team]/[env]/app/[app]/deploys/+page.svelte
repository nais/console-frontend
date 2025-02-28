<script lang="ts">
	import Deployments from '$lib/components/Deployments.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { PageData } from './$houdini';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { AppDeploys } = $derived(data);
</script>

<GraphErrors errors={$AppDeploys.errors} />

{#if $AppDeploys.data}
	<Deployments workload={$AppDeploys.data.team.environment.workload} />
{/if}
