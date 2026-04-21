<script lang="ts">
	import { Detail, Heading } from '@nais/ds-svelte-community';
	import IssueLabel from './IssueLabel.svelte';
	import type { Issue } from './types';

	let {
		data
	}: {
		data: Issue<'FailedSynchronizationIssue'>;
	} = $props();

	let workloadType: 'app' | 'job' = $derived.by(() => {
		return data.workload.__typename === 'Application' ? 'app' : 'job';
	});
</script>

<div class="item">
	<div class="label">
		<IssueLabel
			environmentName={data.teamEnvironment.environment.name}
			teamSlug={data.teamEnvironment.team.slug}
			severity={data.severity}
			resourceName={data.workload.name}
			resourceType={workloadType}
		/>
	</div>
	<div>
		<Heading as="h4" size="xsmall">Workload Failed Synchronization</Heading>
		<Detail><strong>Details:</strong> {data.message}</Detail>
	</div>
</div>

<style>
	.item {
		display: grid;
		grid-template-columns: 25ch auto;
		gap: 1rem;
	}

	.label {
		display: flex;
		align-items: center;
	}
</style>
