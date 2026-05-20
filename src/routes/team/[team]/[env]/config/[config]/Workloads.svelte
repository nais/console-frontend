<script lang="ts">
	import { type Config$result } from '$houdini';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Alert } from '@nais/ds-svelte-community';

	interface Props {
		workloads: Config$result['team']['environment']['config']['workloads'];
	}

	let { workloads }: Props = $props();
</script>

<SurfaceCard title="Used by">
	{#if workloads.nodes.length > 0}
		<ul>
			{#each workloads.nodes as workload (workload.id)}
				<li><WorkloadLink {workload} hideTeam /></li>
			{/each}
		</ul>
	{/if}

	{#if workloads.nodes.length === 0}
		<Alert size="small" variant="info">Config is not in use by any workloads.</Alert>
	{/if}
</SurfaceCard>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0 0 0 1rem;
	}
</style>
