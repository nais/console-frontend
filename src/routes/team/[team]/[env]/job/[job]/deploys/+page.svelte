<script lang="ts">
	import Card from '$lib/Card.svelte';
	import WorkloadDeployments from '$lib/components/WorkloadDeployments.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ JobDeploys } = data);
</script>

<GraphErrors errors={$JobDeploys.errors} />

{#if $JobDeploys.data}
	<Card>
		<Card>
			<WorkloadDeployments workload={$JobDeploys.data.team.environment.workload} />
		</Card>
	</Card>
{/if}
