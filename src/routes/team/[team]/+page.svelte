<script lang="ts">
	import { page } from '$app/state';
	import ActivityLogItem from '$lib/components/ActivityLogItem.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import { supportedErrorTypes } from '$lib/components/errors/ErrorMessage.svelte';
	import TeamErrorMessage from '$lib/components/errors/TeamErrorMessage.svelte';
	import PersistenceLink from '$lib/components/persistence/PersistenceLink.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import VulnerabilityOverview from '$lib/components/VulnerabilityOverview.svelte';
	import { Alert, BodyLong, Heading } from '@nais/ds-svelte-community';
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

	const redisInstances = $derived($TeamOverview.data?.team.redisInstances.nodes);
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
		{#if redisInstances && redisInstances.length > 0}
			<Alert variant="error" size="small">
				<div style="display: flex; align-items: center; gap: var(--a-spacing-2);">
					<Heading level="2" size="small">Action Required – Redis Shutdown Imminent</Heading>
				</div>

				<BodyLong>
					Your team still has active Redis instances, but <strong
						>Aiven Redis will be shut down on March 31, 2025.</strong
					> Migrate your Redis instances to Valkey before the deadline to avoid service disruption.
				</BodyLong>
				<Heading level="3" size="xsmall">Redis instances:</Heading>
				<ul>
					{#each redisInstances as redis (redis.id)}
						<li><PersistenceLink instance={redis} /></li>
					{/each}
				</ul>
			</Alert>
		{/if}
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
				<Heading size="small" level="2">Activity</Heading>
				{#if $TeamOverview.data}
					<div class="raised">
						{#each $TeamOverview.data.team.activityLog.nodes as item (item.id)}
							<div><ActivityLogItem {item} /></div>
						{/each}
					</div>
				{/if}
				<a href="/team/{teamSlug}/activity-log" style:align-self="end" style:margin-top="auto"
					>View Activity Log</a
				>
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
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;

		> div {
			background-color: var(--a-surface-default);
			padding: var(--a-spacing-2) var(--a-spacing-5);
		}

		> div:first-child {
			border-top-left-radius: 8px;
			border-top-right-radius: 8px;
			padding-top: var(--a-spacing-3);
		}

		> div:last-child {
			padding-bottom: var(--a-spacing-3);
			border-bottom-left-radius: 8px;
			border-bottom-right-radius: 8px;
		}
	}
	.activity {
		grid-column: span 2;
		word-wrap: break-word;
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-4);
		min-height: 100%;

		> a {
			align-self: end;
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

	ul {
		padding: 0;
		padding-left: 20px;
		margin: 0;
	}
	ul li {
		margin: var(--a-spacing-1);
	}
</style>
