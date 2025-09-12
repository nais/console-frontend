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
		{#if data.message === 'user_alert_resource_usage_disk'}
			<Heading level="4" size="xsmall" spacing>
				{data.openSearch.name} is low on disk space
			</Heading>
			<Detail
				>Your OpenSearch service {data.openSearch.name} is low on disk space. Write operations will be
				denied and other functionality may become unavailable.</Detail
			>
		{:else}
			<Detail>{data.message}</Detail>
		{/if}
	</div>
</div>

<style>
	.item {
		display: grid;
		grid-template-columns: 300px auto;
		gap: 1rem;
	}
	.label {
		display: flex;
		align-items: center;
	}
</style>
