<script lang="ts">
	import { page } from '$app/state';
	import WorkloadActivityCard from '#lib/domain/activity/WorkloadActivityCard.svelte';
	import CostOverviewChart from '#lib/domain/cost/CostOverviewChart.svelte';
	import CriticalIssuesCard from '#lib/domain/issues/CriticalIssuesCard.svelte';
	import Labels from '#lib/domain/labels/Labels.svelte';
	import Persistence from '#lib/domain/persistence/Persistence.svelte';
	import Configs from '#lib/domain/resources/Configs.svelte';
	import Secrets from '#lib/domain/resources/Secrets.svelte';
	import ServiceAccountBinding from '#lib/domain/resources/ServiceAccountBinding.svelte';
	import ApplicationScalingStatus from '#lib/domain/workload/ApplicationScalingStatus.svelte';
	import { countReadyInstances } from '#lib/domain/workload/applicationReadiness.js';
	import RecentWorkloadEvents from '#lib/domain/workload/RecentWorkloadEvents.svelte';
	import WorkloadDeploy from '#lib/domain/workload/WorkloadDeploy.svelte';
	import WorkloadHealth from '#lib/domain/workload/WorkloadHealth.svelte';
	import { ShAlert, ShSpinner } from '#lib/shadcn/ui/index.js';

	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import InstanceGroups from './InstanceGroups.svelte';

	let { data }: PageProps = $props();
	let { App, AppInstanceGroups, AppDeployment, AppWorkloadEvents, teamSlug } = $derived(data);

	const refetchPolled = () => {
		AppInstanceGroups.fetch({ policy: 'CacheAndNetwork' });
		AppDeployment.fetch({ policy: 'CacheAndNetwork' });
	};

	onMount(() => {
		const interval = setInterval(refetchPolled, 10_000);
		return () => clearInterval(interval);
	});

	let appData = $derived(App ? $App.data : undefined);
	let appErrors = $derived(App ? $App.errors : undefined);
	let appFetching = $derived(App ? $App.fetching : false);
	let app = $derived(appData?.team?.environment?.application ?? null);
	const instanceDiagnostics = $derived($AppInstanceGroups.data?.team?.environment?.application);
	const rolloutIssue = $derived(
		instanceDiagnostics?.rolloutIssues.nodes.find(
			(issue) => issue.__typename === 'ApplicationRolloutStuckIssue'
		)
	);
	const readyInstances = $derived(
		instanceDiagnostics?.instanceGroups.reduce(
			(sum, group) => sum + countReadyInstances(group.instances),
			0
		)
	);
	let criticalEdges = $derived(
		app?.issues.edges.filter((e) => e.node.severity === 'CRITICAL') ?? []
	);

	let application = $derived(page.params.app);
	let environment = $derived(page.params.env);
</script>

<GraphErrors errors={appErrors} />

{#if appFetching}
	<div
		style="display: flex; justify-content: center; align-items: center; height: 320px;"
		role="status"
		aria-label="Loading"
	>
		<ShSpinner size="lg" />
	</div>
{/if}
{#if app}
	<div class="app-overview-workspace">
		<h2 class="sr-only">Overview</h2>
		{#if app?.deletionStartedAt}
			<ShAlert variant="info" size="sm">
				This application is being deleted. Deletion started <Time
					time={app.deletionStartedAt}
					distance
				/>. If the deletion is taking too long, contact the Nais team.
			</ShAlert>
		{/if}

		<!-- Full-width KPI Health Strip -->
		<WorkloadHealth
			{teamSlug}
			environment={environment ?? ''}
			workload={app?.name ?? ''}
			workloadType="app"
			v0sHealth={data.WorkloadHealthV0s}
			criticalIssues={app?.criticalIssues.pageInfo.totalCount ?? 0}
			warningIssues={app?.warningIssues.pageInfo.totalCount ?? 0}
			todoIssues={app?.todoIssues.pageInfo.totalCount ?? 0}
			{readyInstances}
			desiredInstances={instanceDiagnostics?.instanceGroups.reduce(
				(sum, group) => sum + group.desiredInstances,
				0
			)}
			loading={appFetching}
		/>

		<div class="app-bento">
			<div class="main-section">
				{#if criticalEdges.length > 0}
					<CriticalIssuesCard
						title={`Critical issues (${criticalEdges.length})`}
						viewAllHref="/team/{page.params.team}/{page.params.env}/app/{page.params.app}/issues"
						issues={criticalEdges}
					/>
				{/if}
				{#if environment}
					<GraphErrors errors={$AppInstanceGroups.errors} />
					{#if instanceDiagnostics && readyInstances !== undefined}
						<InstanceGroups
							appName={app.name}
							environmentName={environment}
							{teamSlug}
							instanceGroups={instanceDiagnostics.instanceGroups}
							{readyInstances}
							{rolloutIssue}
						/>
						<ApplicationScalingStatus
							scaling={instanceDiagnostics.resources.scaling}
							resizeHref={data.viewerIsMember
								? `/team/${teamSlug}/${environment}/app/${app.name}/resize`
								: undefined}
						/>
					{:else if $AppInstanceGroups.fetching}
						<div role="status" aria-label="Loading instance groups">
							<ShSpinner size="sm" />
						</div>
					{/if}
					<CostOverviewChart workload={app.name} {environment} {teamSlug} />
				{/if}
			</div>
			<div class="side-section">
				<WorkloadDeploy workload={app} legacyDeployDisabled={data.legacyDeployDisabled} />
				<RecentWorkloadEvents
					events={$AppWorkloadEvents.data?.team.environment?.application?.events}
					fetching={$AppWorkloadEvents.fetching}
					failed={Boolean($AppWorkloadEvents.errors?.length)}
					viewAllRoute="/team/[team]/[env]/app/[app]/events"
				/>
				<Persistence workload={app} />
				{#if environment}
					<Configs {environment} workload={app?.name ?? ''} {teamSlug} />
					<Secrets workload={app?.name ?? ''} {environment} {teamSlug} />
					<ServiceAccountBinding workload={app?.name ?? ''} {environment} {teamSlug} />
				{/if}
				<SectionBoundary message="Labels failed to render.">
					<Labels labels={app.labels ?? []} />
				</SectionBoundary>
				{#if environment && application}
					<SectionBoundary message="Workload activity failed to render.">
						<WorkloadActivityCard
							{teamSlug}
							env={environment}
							workload={application}
							workloadType="app"
							viewAllHref="/team/{teamSlug}/{environment}/app/{application}/activity-log"
						/>
					</SectionBoundary>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.app-overview-workspace {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-20);
	}

	.app-bento {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
		gap: var(--nais-space-20);
		align-items: start;
	}

	.main-section,
	.side-section {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-20);
		min-width: 0;
	}

	@media (max-width: 1024px) {
		.app-bento {
			grid-template-columns: 1fr;
		}
	}
</style>
