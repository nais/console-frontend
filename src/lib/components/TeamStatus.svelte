<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { TeamStatusVariables } from './$houdini';

	export let teamName: string;

	export const _TeamStatusVariables: TeamStatusVariables = () => {
		return { team: teamName };
	};

	const status = graphql(`
		query TeamStatus($team: String!) @cache(policy: NetworkOnly) @load {
			team(name: $team) @loading(cascade: true) {
				status {
					apps {
						failing
						total
					}
					jobs {
						failing
						total
					}
				}
			}
		}
	`);
</script>

<h4>Workloads</h4>
{#if $status.data}
	{#if $status.data.team.status.apps.failing !== PendingValue && $status.data.team.status.apps.failing > 0}
		<p>
			<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-danger)" />
			<a href="/team/{teamName}/applications">
				{$status.data.team.status.apps.failing} app{$status.data.team.status.apps.failing > 1
					? 's'
					: ''}</a
			>
			failing
		</p>
	{:else if $status.data.team.status.apps.total !== PendingValue && $status.data.team.status.apps.total > 0}
		<p>
			<Nais size="1rem" style="color: var(--a-icon-success)" role="image" />
			<a href="/team/{teamName}/applications">
				{$status.data.team.status.apps.total} app{$status.data.team.status.apps.total > 1
					? 's'
					: ''}</a
			>
		</p>
	{/if}
	{#if $status.data.team.status.jobs.failing !== PendingValue && $status.data.team.status.jobs.failing > 0}
		<p>
			<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-danger)" />
			<a href="/team/{teamName}/jobs">
				{$status.data.team.status.jobs.failing} job{$status.data.team.status.jobs.failing > 1
					? 's'
					: ''}</a
			> failing
		</p>
	{:else if $status.data.team.status.jobs.total !== PendingValue && $status.data.team.status.jobs.total > 0}
		<p>
			<Nais size="1rem" style="color: var(--a-icon-success)" role="image" />
			<a href="/team/{teamName}/jobs"
				>{$status.data.team.status.jobs.total} job{$status.data.team.status.jobs.total > 1
					? 's'
					: ''}</a
			>
		</p>
	{/if}
{/if}

<style>
</style>
