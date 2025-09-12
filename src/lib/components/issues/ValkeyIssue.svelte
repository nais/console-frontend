<script lang="ts">
	import type { IssueFragment$data } from '$houdini';
	import { BodyShort, Heading } from '@nais/ds-svelte-community';
	import IssueLabel from './IssueLabel.svelte';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'ValkeyIssue' }>;
	} = $props();
</script>

<div class="item">
	<div class="label">
		<IssueLabel
			environmentName={data.teamEnvironment.environment.name}
			teamSlug={data.teamEnvironment.team.slug}
			severity={data.severity}
			resourceName={data.valkey.name}
			resourceType="valkey"
		/>
	</div>

	<div>
		<Heading level="4" size="xsmall" spacing>Valkey issue</Heading>
		<BodyShort>{data.message}</BodyShort>
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
