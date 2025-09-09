<script lang="ts">
	import type { IssueFragment$data } from '$houdini';
	import { BodyShort } from '@nais/ds-svelte-community';
	import IssueLabel from './IssueLabel.svelte';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'NoRunningInstancesIssue' }>;
	} = $props();

	let workloadType: 'app' | 'job' = $derived.by(() => {
		return data.workload.__typename === 'Application' ? 'app' : 'job';
	});
</script>

<div class="item">
	<div>
		<IssueLabel
			environmentName={data.teamEnvironment.environment.name}
			teamSlug={data.teamEnvironment.team.slug}
			severity={data.severity}
			workloadName={data.workload.name}
			{workloadType}
		/>
	</div>

	<div>
		<BodyShort>{data.message}</BodyShort>
	</div>
</div>

<style>
	.item {
		display: grid;
		grid-template-columns: 300px auto;
		gap: 1rem;
	}
</style>
