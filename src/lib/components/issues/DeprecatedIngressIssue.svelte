<script lang="ts">
	import type { IssueFragment$data } from '$houdini';
	import { Detail, Heading } from '@nais/ds-svelte-community';
	import IssueLabel from './IssueLabel.svelte';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'DeprecatedIngressIssue' }>;
	} = $props();
</script>

<div class="item">
	<div class="label">
		<IssueLabel
			environmentName={data.teamEnvironment.environment.name}
			teamSlug={data.teamEnvironment.team.slug}
			severity={data.severity}
			resourceName={data.application.name}
			resourceType="app"
		/>
	</div>

	<div>
		<Heading level="4" size="xsmall">Deprecated Ingress</Heading>
		<Detail>
			{#if data.ingresses.length === 1}
				Application {data.application.name} is using a deprecated ingress:
			{:else}
				Application {data.application.name} is using deprecated ingresses:
			{/if}
		</Detail>
		{#each data.ingresses as ingress (ingress)}
			<Detail><span style="word-break: break-word;">{ingress}</span></Detail>
		{/each}
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
