<script lang="ts">
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';

	interface Props {
		workloads: {
			nodes: ReadonlyArray<{
				id: string;
				name: string;
				__typename: string | null | undefined;
				teamEnvironment: {
					environment: { name: string };
				};
				team: { slug: string };
			}>;
		};
	}

	let { workloads }: Props = $props();
</script>

<div>
	<Heading as="h2" size="medium" spacing>Used by</Heading>
	{#if workloads.nodes.length > 0}
		<ul>
			{#each workloads.nodes as workload (workload.id)}
				<li><WorkloadLink {workload} /></li>
			{/each}
		</ul>
	{/if}

	{#if workloads.nodes.length === 0}
		<Alert size="small" variant="info">Config is not in use by any workloads.</Alert>
	{/if}
</div>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0 0 0 1rem;
	}
</style>
