<script lang="ts">
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { AllIssues } = $derived(data);
	let value = $state('DeprecatedIngressIssue');
	let issues = $derived(
		$AllIssues.data?.teams.nodes.flatMap((team) =>
			team.issues.nodes.filter((issue) => issue.__typename === value)
		) ?? []
	);
</script>

<select bind:value>
	{#each ['DeprecatedIngressIssue', 'DeprecatedRegistryIssue', 'MissingSbomIssue', 'InvalidSpecIssue', 'VulnerableImageIssue', 'FailedSynchronizationIssue', 'OpenSearchIssue', 'SqlInstanceStateIssue', 'SqlInstanceVersionIssue', 'ValkeyIssue', 'LastRunFailedIssue', 'NoRunningInstancesIssue'] as type (type)}
		<option value={type}>{type}</option>
	{/each}
</select>

<Heading level="1" size="large" spacing>{issues.length}</Heading>
<div class="grid">
	{#if $AllIssues.data}
		{#each issues as issue (issue.id)}
			<div>
				{issue.__typename}: {issue.message}
			</div>
			<div>
				<a href="/team/{issue.teamEnvironment.team.slug}/issues">
					{issue.teamEnvironment.team.slug + '/' + issue.teamEnvironment.environment.name}
				</a>
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
