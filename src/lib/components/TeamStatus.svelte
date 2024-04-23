<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';
	import { Skeleton } from '@nais/ds-svelte-community';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { TeamStatusVariables } from './$houdini';

	export let teamName: string;

	export const _TeamStatusVariables: TeamStatusVariables = () => {
		return { team: teamName };
	};

	const status = graphql(`
		query TeamStatus($team: Slug!) @cache(policy: NetworkOnly) @load {
			team(slug: $team) @loading(cascade: true) {
				id @loading
				status {
					apps {
						failing
						total
					}
					jobs {
						failing
						total
					}
					sqlInstances {
						otherConditions
						failing
						total
					}
				}
			}
		}
	`);

	$: team = $status.data?.team;
</script>

<h4>Inventory</h4>
{#if team && team.id !== PendingValue}
	{#if team.status.apps.failing > 0}
		<p>
			<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-danger)" />
			<a href="/team/{teamName}/applications">
				{team.status.apps.failing}/{team.status.apps.total} app{team.status.apps.failing > 1
					? 's'
					: ''}</a
			>
			failing
		</p>
	{:else if team.status.apps.total > 0}
		<p>
			<Nais size="1rem" style="color: var(--a-icon-success)" role="image" />
			<a href="/team/{teamName}/applications">
				{team.status.apps.total} app{team.status.apps.total > 1 ? 's' : ''}</a
			>
		</p>
	{/if}
	{#if team.status.jobs.failing > 0}
		<p>
			<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-danger)" />
			<a href="/team/{teamName}/jobs">
				{team.status.jobs.failing}/{team.status.jobs.total} job{team.status.jobs.failing > 1
					? 's'
					: ''}</a
			> failing
		</p>
	{:else if team.status.jobs.total > 0}
		<p>
			<Nais size="1rem" style="color: var(--a-icon-success)" role="image" />
			<a href="/team/{teamName}/jobs"
				>{team.status.jobs.total} job{team.status.jobs.total > 1 ? 's' : ''}</a
			>
		</p>
	{/if}
	{#if team.status.sqlInstances.failing > 0}
		<p>
			<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-danger)" />
			<a href="/team/{teamName}/postgres">
				{team.status.sqlInstances.failing}/{team.status.sqlInstances.total} postgres</a
			> failing
		</p>
		{#if team.status.sqlInstances.otherConditions > 0}
			<p>
				<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-info)" />
				<a href="/team/{teamName}/postgres">
					{team.status.sqlInstances.otherConditions}/{team.status.sqlInstances.total} postgres</a
				> with conditions
			</p>
		{/if}
		{:else if team.status.sqlInstances.otherConditions > 0}
		<p>
			<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-info)" />
			<a href="/team/{teamName}/postgres">
				{team.status.sqlInstances.otherConditions}/{team.status.sqlInstances.total} postgres</a
			> Reporting issues
		</p>
	{:else if team.status.sqlInstances.total > 0}
		<p>
			<Nais size="1rem" style="color: var(--a-icon-success)" role="image" />
			<a href="/team/{teamName}/postgres">{team.status.sqlInstances.total} postgres</a>
		</p>
	{/if}
	<!-- TODO: Team status NAIS icon -->
{:else if team && team.id === PendingValue}
	<Skeleton variant="text" width="100px" />
	<Skeleton variant="text" width="120px" />
{/if}

<style>
</style>
