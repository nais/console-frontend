<script lang="ts">
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { AllErrors } = $derived(data);
	let value = $state('WorkloadStatusDeprecatedIngress');
	let workloads = $derived(
		$AllErrors.data?.teams.nodes.flatMap((team) =>
			team.workloads.nodes.filter((workload) =>
				workload.status.errors.some((error) => error.__typename === value)
			)
		) ?? []
	);
</script>

<select bind:value>
	{#each ['WorkloadStatusInvalidNaisYaml', 'WorkloadStatusSynchronizationFailing', 'WorkloadStatusNoRunningInstances', 'WorkloadStatusVulnerable', 'WorkloadStatusFailedRun', 'WorkloadStatusMissingSBOM', 'WorkloadStatusDeprecatedIngress', 'WorkloadStatusDeprecatedRegistry'] as type (type)}
		<option value={type}>{type}</option>
	{/each}
</select>

<Heading level="1" size="large" spacing>{workloads.length}</Heading>
<div class="grid">
	{#if $AllErrors.data}
		{#each workloads as workload (workload.id)}
			<div><WorkloadLink {workload} /></div>
			<div>
				{JSON.stringify(
					workload.status.errors.find((error) => error.__typename === value),
					null,
					2
				)}
				{#if workload.__typename === 'Application'}
					{#each workload.instances.nodes as instance (instance.id)}
						{#if instance.status.state !== 'RUNNING'}
							{JSON.stringify(instance.status, null, 2)}
						{/if}
					{/each}
				{:else if workload.__typename === 'Job'}
					{#each workload.runs.nodes as run (run.id)}
						{#if run.status.state !== 'SUCCEEDED'}
							{JSON.stringify(run.status, null, 2)}
						{/if}
					{/each}
				{/if}
			</div>
		{/each}
	{/if}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
</style>
