<script lang="ts">
	import { graphql, PendingValue } from '$houdini';
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
					state
					apps {
						failing
						vulnerabilities
					}
					jobs {
						failing
						vulnerabilities
					}
					sqlInstances {
						otherConditions
						failing
					}
				}
			}
		}
	`);

	$: team = $status.data?.team;
	$: state = $status.data?.team.status.state;
</script>

<div class="card {state?.toString()}">
	{#if team && team.id !== PendingValue}
		{#if state === 'NAIS'}
			<h4>Status</h4>
			<div class="iconWrapper">
				<Nais
					size="5rem"
					style="color: var(--a-icon-success)"
					aria-label="Application is nais"
					role="image"
				/>
			</div>
		{:else if state === 'NOTNAIS'}
			<h4>Status <ExclamationmarkTriangleFillIcon style="color: var(--a-icon-warning)" /></h4>
		{:else if state === 'FAILING'}
			<h4>
				Status
				<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-danger)" />
			</h4>
		{/if}
		{#if team.status.apps.failing > 0}
			<a href="/team/{teamName}/applications">
				{team.status.apps.failing} app{team.status.apps.failing > 1 ? 's' : ''}</a
			>
			failing
		{/if}
		{#if team.status.sqlInstances.failing > 0 || team.status.sqlInstances.otherConditions > 0}
			<p>
				<a href="/team/{teamName}/postgres">
					{team.status.sqlInstances.failing + team.status.sqlInstances.otherConditions} postgres</a
				> reporting issues
			</p>
		{/if}
		{#if team.status.jobs.failing > 0}
			<p>
				<a href="/team/{teamName}/jobs">
					{team.status.jobs.failing} job{team.status.jobs.failing > 1 ? 's' : ''}</a
				> failing
			</p>
		{/if}
		{#if team.status.apps.vulnerabilities > 0}
			<p>
				<a href="/team/{teamName}/vulnerabilities">
					{team.status.apps.vulnerabilities} app{team.status.apps.vulnerabilities > 1 ? 's' : ''}</a
				> with vulnerabilities
			</p>
		{/if}
		{#if team.status.jobs.vulnerabilities > 0}
			<p>
				<a href="/team/{teamName}/vulnerabilities">
					{team.status.jobs.vulnerabilities} job{team.status.jobs.vulnerabilities > 1 ? 's' : ''}</a
				> with vulnerabilities
			</p>
		{/if}
	{:else if team && team.id === PendingValue}
		<Skeleton variant="text" width="100px" />
		<Skeleton variant="text" width="120px" />
		<Skeleton variant="text" width="120px" />
	{/if}
</div>

<style>
	h4 {
		margin-bottom: 8px;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.iconWrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		vertical-align: middle;
		padding-top: 1rem;
	}

	.card {
		border-radius: 0.5rem;
		padding: 1rem;
		grid-column: span 3;
		grid-row: span 1;
		background-color: var(--a-bg-default);
		border: 1px solid var(--active-color-strong);
	}

	.UNKOWN {
		background-color: var(--a-bg-default);
	}

	.NAIS {
		background-color: var(--a-bg-default);
	}

	.NOTNAIS {
		background-color: var(--a-surface-warning-moderate);
		color: var(--a-text-on-warning);
		border: 1px solid var(--a-border-warning);
	}

	.FAILING {
		background-color: var(--a-surface-danger-subtle);
		border: 1px solid var(--a-border-danger);
	}
</style>
