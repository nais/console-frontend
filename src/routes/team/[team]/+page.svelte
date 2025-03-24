<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/Card.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';

	import { supportedErrorTypes } from '$lib/components/errors/ErrorMessage.svelte';
	import TeamErrorMessage from '$lib/components/errors/TeamErrorMessage.svelte';
	import TeamVulnerabilitySummary from '$lib/components/TeamVulnerabilitySummary.svelte';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TeamOverview, teamSlug, viewerIsMember } = $derived(data);

	const getWorkloadsWithError = (errorType: (typeof supportedErrorTypes)[number]) => {
		const workloads = $TeamOverview.data?.team.workloads.nodes.filter((workload) =>
			workload.status.errors.some((error) => error.__typename === errorType)
		);
		if (workloads?.length) {
			return {
				__typename: errorType,
				level: workloads[0].status.errors.find((error) => error.__typename === errorType)?.level,
				workloads
			};
		} else {
			return {
				__typename: errorType
			};
		}
	};
</script>

{#if page.url.searchParams.has('deleted')}
	{@const msgParts = (page.url.searchParams.get('deleted') || '').split('/')}
	<Alert variant="success" size="small">
		Successfully deleted {msgParts[0]}
		{msgParts[1]}.
	</Alert>
{/if}
<div class="alerts-wrapper">
	{#each supportedErrorTypes.map(getWorkloadsWithError) as errors (errors.__typename)}
		{#if errors.workloads?.length && errors.level}
			<TeamErrorMessage
				error={{
					__typename: errors.__typename,
					level: errors.level
				}}
				{teamSlug}
				workloads={errors.workloads}
			/>
		{/if}
	{/each}
</div>
<div class="grid">
	{#if $TeamOverview.data}
		<div class="card members">
			<Heading size="medium" level="2">
				{$TeamOverview.data.team.members.pageInfo.totalCount} team members
			</Heading>
			<div class="names">
				{#each $TeamOverview.data.team.members.nodes as member (member.user.id)}
					<div>{member.user.name}</div>
				{/each}
			</div>
			<a href="/team/{teamSlug}/members">
				{viewerIsMember ? 'Manage team members' : 'View member details'}
			</a>
		</div>
	{/if}
	<Card rows={1} columns={1}>
		<TeamVulnerabilitySummary {teamSlug} />
	</Card>

	<Card rows={1} columns={1}>
		<TeamUtilizationAndOverage {teamSlug} />
	</Card>
	<Card rows={1} columns={1}>
		<AggregatedCostForTeam {teamSlug} />
	</Card>
</div>

<style>
	.members {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--a-spacing-2);
	}
	.card {
		background-color: var(--a-surface-subtle);
		padding: var(--a-spacing-5);
		border-radius: 12px;
	}

	.names {
		overflow-y: auto;
		align-self: stretch;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-auto-rows: 350px;
		gap: 1rem;
	}
	.grid:not(:first-child) {
		margin-top: 1rem;
	}

	.alerts-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-2);
	}
</style>
