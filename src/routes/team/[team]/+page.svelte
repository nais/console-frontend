<script lang="ts">
	import { page } from '$app/state';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';

	import ActivityLogItem from '$lib/components/ActivityLogItem.svelte';
	import { supportedErrorTypes } from '$lib/components/errors/ErrorMessage.svelte';
	import TeamErrorMessage from '$lib/components/errors/TeamErrorMessage.svelte';
	import VulnerabilityOverview from '$lib/components/VulnerabilityOverview.svelte';
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
<div class="wrapper">
	<div class="alerts-wrapper">
		{#each supportedErrorTypes
			.map(getWorkloadsWithError)
			.filter((error) => error.__typename !== 'WorkloadStatusVulnerable') as errors (errors.__typename)}
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
		<div class="card"><TeamUtilizationAndOverage {teamSlug} /></div>
		<div class="card"><AggregatedCostForTeam {teamSlug} /></div>
		{#if viewerIsMember}
			<div class="card activity">
				<Heading size="small" level="2" spacing>Latest activity</Heading>
				{#if $TeamOverview.data}
					<div class="raised">
						<ActivityLogItem item={$TeamOverview.data.team.activityLog.nodes[0]} />
					</div>
				{/if}
				<a href="/team/{teamSlug}/activity-log">View all activity</a>
			</div>
		{/if}
	</div>
	<div style="display: grid; gap: var(--a-spacing-2);">
		<div style="display: flex; align-items: center; gap: var(--a-spacing-4);">
			<Heading level="2" size="medium">Vulnerabilities</Heading>
			<a href="/team/{teamSlug}/vulnerabilities">View all vulnerabilities</a>
		</div>

		{#if $TeamOverview.data?.team}
			<VulnerabilityOverview team={$TeamOverview.data.team} />
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
	.raised {
		padding: var(--a-spacing-4) var(--a-spacing-5);
		background-color: var(--a-surface-default);
		border-radius: 8px;
	}
	.activity {
		word-wrap: break-word;

		> a {
			margin-top: var(--a-spacing-4);
		}
	}
	.card {
		background-color: var(--a-surface-subtle);
		padding: var(--a-spacing-4) var(--a-spacing-5);
		border-radius: 12px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
