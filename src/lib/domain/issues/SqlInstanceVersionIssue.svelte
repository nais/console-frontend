<script lang="ts">
	import { Detail, Heading } from '@nais/ds-svelte-community';
	import IssueLabel from './IssueLabel.svelte';
	import type { Issue } from './types';

	let {
		data
	}: {
		data: Issue<'SqlInstanceVersionIssue'>;
	} = $props();
</script>

<div class="item">
	<div class="label">
		<IssueLabel
			environmentName={data.teamEnvironment.environment.name}
			teamSlug={data.teamEnvironment.team.slug}
			severity={data.severity}
			resourceName={data.sqlInstance.name}
			resourceType="cloudsql"
		/>
	</div>

	<div>
		<Heading as="h4" size="xsmall">Deprecated SQL Instance Version</Heading>
		<Detail>{data.message}</Detail>
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
