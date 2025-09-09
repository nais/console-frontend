<script lang="ts">
	import type { IssueFragment$data } from '$houdini';
	import { BodyShort } from '@nais/ds-svelte-community';
	import IssueLabel from './IssueLabel.svelte';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'FailedJobRunsIssue' }>;
	} = $props();
</script>

<div class="item">
	<div>
		<IssueLabel
			environmentName={data.teamEnvironment.environment.name}
			teamSlug={data.teamEnvironment.team.slug}
			severity={data.severity}
			workloadName={data.job.name}
			workloadType="job"
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
