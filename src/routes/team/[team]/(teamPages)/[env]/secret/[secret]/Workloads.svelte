<script lang="ts">
	import { type Secret$result } from '$houdini';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { Alert, HelpText } from '@nais/ds-svelte-community';

	export let workloads: Secret$result['team']['environment']['secret']['workloads'];
</script>

<h4>
	Used by
	<HelpText title="List of workloads using this secret" placement="bottom">
		All workloads that use this secret.
	</HelpText>
</h4>

{#if workloads.nodes.length > 0}
	<h5>Workloads</h5>
	<ul>
		{#each workloads.nodes as workload}
			<li><WorkloadLink {workload} /></li>
		{/each}
	</ul>
{/if}

{#if workloads.nodes.length === 0}
	<Alert size="small" variant="info">Secret is not in use by any workloads.</Alert>
{/if}

<style>
	h4 {
		display: flex;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
	}

	h5 {
		margin-top: 1rem;
		gap: 0.5rem;
	}

	ul {
		list-style: none;
		margin: 0 0 1rem 0;
		padding: 0 1rem 0 1rem;
	}
</style>
