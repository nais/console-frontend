<script lang="ts">
	import type { IssueFragment$data } from '$houdini';
	import { Detail, Heading } from '@nais/ds-svelte-community';
	import IssueLabel from './IssueLabel.svelte';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'OpenSearchIssue' }>;
	} = $props();
</script>

<div class="item">
	<div class="label">
		<IssueLabel
			environmentName={data.teamEnvironment.environment.name}
			teamSlug={data.teamEnvironment.team.slug}
			severity={data.severity}
			resourceName={data.openSearch.name}
			resourceType="opensearch"
		/>
	</div>

	<div>
		<Heading as="h4" size="xsmall">
			Issues with OpenSearch {data.openSearch.name}
		</Heading>
		<Detail>{data.message}</Detail>
	</div>
</div>

<style>
	.item {
		display: grid;
		grid-template-columns: 25ch auto;
		gap: 1rem;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.item {
			grid-template-columns: 1fr;
			gap: var(--ax-space-8);
		}
	}
	.label {
		display: flex;
		align-items: center;
	}
</style>
