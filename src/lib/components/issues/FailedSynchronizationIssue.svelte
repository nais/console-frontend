<script lang="ts">
	import type { IssueFragment$data } from '$houdini';
	import { Detail, Heading } from '@nais/ds-svelte-community';
	import IssueLabel from './IssueLabel.svelte';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'FailedSynchronizationIssue' }>;
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
		<Heading level="4" size="xsmall">Workload Failed Synchronization</Heading>
		<Detail><strong>Details:</strong> {data.message}</Detail>
	</div>
</div>

<style>
	.item {
		display: grid;
		grid-template-columns: 200px auto;
		gap: 1rem;
	}

	.label {
		display: flex;
		align-items: center;
	}
</style>
