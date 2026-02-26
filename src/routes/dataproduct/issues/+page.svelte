<script lang="ts">
	import { page } from '$app/state';
	import { IssueType } from '$houdini';
	import { issueTypeLabel } from '$lib/utils/issueTypeLabel';
	import { changeParams } from '$lib/utils/searchparams';
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { AllIssues } = $derived(data);
	let value = $state(page.url.searchParams.get('issueType') ?? IssueType.DEPRECATED_INGRESS);

	$effect(() => {
		const selectedType = page.url.searchParams.get('issueType') ?? IssueType.DEPRECATED_INGRESS;
		if (value !== selectedType) {
			value = selectedType;
		}
	});

	$effect(() => {
		if (value !== (page.url.searchParams.get('issueType') ?? IssueType.DEPRECATED_INGRESS)) {
			changeParams({ issueType: value });
		}
	});

	let issues = $derived($AllIssues.data?.teams.nodes.flatMap((team) => team.issues.nodes) ?? []);
</script>

<select bind:value>
	{#each Object.values(IssueType) as type (type)}
		<option value={type}>{issueTypeLabel(type)}</option>
	{/each}
</select>

<Heading as="h1" size="large" spacing>{issues.length}</Heading>
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
