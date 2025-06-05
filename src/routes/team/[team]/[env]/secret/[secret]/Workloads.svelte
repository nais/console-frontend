<script lang="ts">
	import { type Secret$result } from '$houdini';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';

	interface Props {
		workloads: Secret$result['team']['environment']['secret']['workloads'];
	}

	let { workloads }: Props = $props();
</script>

<div class="card">
	<Heading level="2" size="medium" spacing>Used by</Heading>
	{#if workloads.nodes.length > 0}
		<ul>
			{#each workloads.nodes as workload (workload.id)}
				<li><WorkloadLink {workload} /></li>
			{/each}
		</ul>
	{/if}

	{#if workloads.nodes.length === 0}
		<Alert size="small" variant="info">Secret is not in use by any workloads.</Alert>
	{/if}
</div>

<style>
	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-20) var(--ax-space-20);
		border-radius: 12px;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0 0 0 1rem;
	}
</style>
