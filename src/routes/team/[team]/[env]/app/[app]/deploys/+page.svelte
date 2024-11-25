<script lang="ts">
	import Card from '$lib/Card.svelte';
	import WorkloadDeployments from '$lib/components/WorkloadDeployments.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ AppDeploys } = data);
</script>

<GraphErrors errors={$AppDeploys.errors} />

{#if $AppDeploys.data}
	<Card>
		<WorkloadDeployments workload={$AppDeploys.data.team.environment.workload} />
	</Card>
{/if}
