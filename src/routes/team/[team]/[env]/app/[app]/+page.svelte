<script lang="ts">
	import { page } from '$app/state';
	import WorkloadActivityCard from '$lib/domain/activity/WorkloadActivityCard.svelte';
	import CostOverviewChart from '$lib/domain/cost/CostOverviewChart.svelte';
	import CriticalIssuesCard from '$lib/domain/issues/CriticalIssuesCard.svelte';
	import Persistence from '$lib/domain/persistence/Persistence.svelte';
	import Configs from '$lib/domain/resources/Configs.svelte';
	import Secrets from '$lib/domain/resources/Secrets.svelte';
	import SbomStatusIcon from '$lib/domain/vulnerability/SbomStatusIcon.svelte';
	import WorkloadVulnerabilitySummary from '$lib/domain/vulnerability/WorkloadVulnerabilitySummary.svelte';
	import WorkloadDeploy from '$lib/domain/workload/WorkloadDeploy.svelte';
	import WorkloadHealth from '$lib/domain/workload/WorkloadHealth.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import PageModal from '$lib/ui/PageModal.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { sbomStatusDetails } from '$lib/utils/vulnerabilities';
	import { Alert, Button, Heading, Loader, Tag } from '@nais/ds-svelte-community';
	import { ArrowCirclepathIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import InstanceGroups from './InstanceGroups.svelte';
	import EnvPage from './env/+page.svelte';
	import ResizePage from './resize/+page.svelte';

	let { data }: PageProps = $props();
	let { App, AppInstanceGroups, teamSlug } = $derived(data);

	const refetchInstanceGroups = () => {
		AppInstanceGroups.fetch({ policy: 'CacheAndNetwork' });
	};

	onMount(() => {
		const interval = setInterval(refetchInstanceGroups, 10_000);
		return () => clearInterval(interval);
	});

	let appData = $derived(App ? $App.data : undefined);
	let appErrors = $derived(App ? $App.errors : undefined);
	let appFetching = $derived(App ? $App.fetching : false);
	let app = $derived(appData?.team?.environment?.application ?? null);
	let appInstanceGroups = $derived(
		$AppInstanceGroups.data?.team?.environment?.application?.instanceGroups ?? []
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
		style="display: flex; justify-content: center; align-items: center; height: 500px;"
		role="status"
		aria-label="Loading"
	>
		<Loader size="3xlarge" />
	</div>
{/if}
{#if app}
	{@const imageStaleness = sbomStatusDetails({
		status: app.image.sbom.status,
		sbomProcessingStartedAt: app.image.sbom.processingStartedAt,
		hasVulnerabilityData: !!(app.image.sbom.status === 'READY' && app.image.vulnerabilitySummary)
	})}
	<div class="wrapper">
		<div class="app-content">
			<div class="main-section">
				<Heading as="h2" class="aksel-sr-only">Overview</Heading>
				{#if app?.deletionStartedAt}
					<Alert variant="info" size="small" fullWidth={false}>
						This application is being deleted. Deletion started <Time
							time={app.deletionStartedAt}
							distance
						/>. If the deletion is taking too long, contact the Nais team.
					</Alert>
				{/if}
				{#if criticalEdges.length > 0}
					<CriticalIssuesCard
						title={`Critical issues (${criticalEdges.length})`}
						viewAllHref="/team/{page.params.team}/{page.params.env}/app/{page.params.app}/issues"
						issues={criticalEdges}
					/>
				{/if}
				<WorkloadHealth
					{teamSlug}
					environment={environment ?? ''}
					workload={app?.name ?? ''}
					workloadType="app"
					criticalIssues={app?.criticalIssues.pageInfo.totalCount ?? 0}
					warningIssues={app?.warningIssues.pageInfo.totalCount ?? 0}
					todoIssues={app?.todoIssues.pageInfo.totalCount ?? 0}
					readyInstances={appInstanceGroups.reduce((sum, g) => sum + g.readyInstances, 0) ?? 0}
					desiredInstances={appInstanceGroups.reduce((sum, g) => sum + g.desiredInstances, 0) ?? 0}
					loading={appFetching}
				/>
				{#if environment}
					<InstanceGroups
						appName={app.name}
						environmentName={environment}
						{teamSlug}
						instanceGroups={appInstanceGroups}
					/>
					<CostOverviewChart workload={app.name} {environment} {teamSlug} />
				{/if}
				<div>
					<div style="display: flex; align-items: center; gap: var(--ax-space-4);">
						<Heading as="h2" size="small">Vulnerabilities</Heading>
						<SbomStatusIcon indicator={imageStaleness.iconIndicator} label={imageStaleness.label} />
					</div>
					<WorkloadVulnerabilitySummary workload={app} />
				</div>
			</div>
			<div class="layout-sidebar">
				<WorkloadDeploy workload={app} />
				<Persistence workload={app} />
				{#if environment}
					<Configs {environment} workload={app?.name ?? ''} {teamSlug} />
					<Secrets workload={app?.name ?? ''} {environment} {teamSlug} />
				{/if}
				{#if environment && application}
					<WorkloadActivityCard
						{teamSlug}
						env={environment}
						workload={application}
						workloadType="app"
						viewAllHref="/team/{teamSlug}/{environment}/app/{application}/activity-log"
					/>
				{/if}
			</div>
		</div>
		{#if page.state.modalHref?.includes('/resize')}
			<PageModal content={ResizePage} header="Resize app" />
		{:else if page.state.modalHref?.includes('/env')}
			<PageModal content={EnvPage} header="Set environment variables" />
		{/if}
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.main-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.app-content {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}

	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.app-content {
			grid-template-columns: 1fr;
		}
	}
</style>
