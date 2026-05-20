<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import WorkloadActivityCard from '$lib/domain/activity/WorkloadActivityCard.svelte';
	import CostOverviewChart from '$lib/domain/cost/CostOverviewChart.svelte';
	import CriticalIssuesCard from '$lib/domain/issues/CriticalIssuesCard.svelte';
	import Persistence from '$lib/domain/persistence/Persistence.svelte';
	import Configs from '$lib/domain/resources/Configs.svelte';
	import Manifest from '$lib/domain/resources/Manifest.svelte';
	import Secrets from '$lib/domain/resources/Secrets.svelte';
	import WorkloadDeploy from '$lib/domain/workload/WorkloadDeploy.svelte';
	import WorkloadHealth from '$lib/domain/workload/WorkloadHealth.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import HeaderActions from '$lib/ui/HeaderActions.svelte';
	import PageModal, { pageModalClick } from '$lib/ui/PageModal.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Alert, Button, Heading, Loader, Modal } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuItem
	} from '@nais/ds-svelte-community/experimental';
	import {
		ArrowCirclepathIcon,
		ArrowsUpDownIcon,
		FileTextIcon,
		MenuElipsisVerticalIcon,
		StopIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import InstanceGroups from './InstanceGroups.svelte';
	import ResizePage from './resize/+page.svelte';

	let { data }: PageProps = $props();
	let { App, AppInstanceGroups, teamSlug, viewerIsMember } = $derived(data);

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

	const restartAppMutation = $derived(
		graphql(`
			mutation RestartApp($team: Slug!, $environment: String!, $application: String!) {
				restartApplication(
					input: { teamSlug: $team, environmentName: $environment, name: $application }
				) {
					application {
						name
					}
				}
			}
		`)
	);

	let application = $derived(page.params.app);
	let environment = $derived(page.params.env);

	const stopAppMutation = $derived(
		graphql(`
			mutation StopApp($team: Slug!, $environment: String!, $application: String!) {
				updateApplication(
					input: {
						teamSlug: $team
						environmentName: $environment
						name: $application
						replicas: { min: 0, max: 0 }
					}
				) {
					application {
						name
					}
				}
			}
		`)
	);

	let restart = $state(false);
	let stop = $state(false);
	let showManifest = $state(false);

	const openRestart = () => {
		restart = true;
	};

	const openStop = () => {
		stop = true;
	};

	const submitStop = () => {
		if (!application || !environment) return;
		stopAppMutation.mutate({
			application,
			environment,
			team: teamSlug
		});
	};

	const submitRestart = () => {
		if (!application || !environment) {
			console.error('Application or environment is not defined');
			return;
		}
		restartAppMutation.mutate({
			application,
			environment,
			team: teamSlug
		});
		refetchInstanceGroups();
	};

	$inspect(app);
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
	{#if viewerIsMember}
		<HeaderActions>
			<ActionMenu>
				{#snippet trigger(props)}
					<Button
						variant="secondary"
						size="small"
						icon={MenuElipsisVerticalIcon}
						iconPosition="right"
						{...props}
					>
						Actions
					</Button>
				{/snippet}
				<button
					class="action-menu-button"
					onclick={openRestart}
					disabled={app?.deletionStartedAt !== null}
				>
					<ActionMenuItem icon={ArrowCirclepathIcon} disabled={app?.deletionStartedAt !== null}>
						Restart
					</ActionMenuItem>
				</button>
				<button
					class="action-menu-button"
					onclick={openStop}
					disabled={app?.deletionStartedAt !== null}
				>
					<ActionMenuItem icon={StopIcon} disabled={app?.deletionStartedAt !== null}>
						Stop
					</ActionMenuItem>
				</button>
				<a
					class="action-menu-button"
					href="/team/{page.params.team}/{page.params.env}/app/{page.params.app}/resize"
					onclick={pageModalClick}
				>
					<ActionMenuItem icon={ArrowsUpDownIcon}>Resize</ActionMenuItem>
				</a>
				<button class="action-menu-button" onclick={() => (showManifest = true)}>
					<ActionMenuItem icon={FileTextIcon}>View manifest</ActionMenuItem>
				</button>
				<ActionMenuDivider />

				<a
					class="action-menu-button"
					href="/team/{page.params.team}/{page.params.env}/app/{page.params.app}/delete"
				>
					<ActionMenuItem icon={TrashIcon} variant="danger">Delete</ActionMenuItem>
				</a>
			</ActionMenu>
		</HeaderActions>
	{/if}

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
			</div>
			<div class="sidebar">
				<WorkloadDeploy workload={app} />
				{#if environment && application}
					<WorkloadActivityCard
						{teamSlug}
						env={environment}
						workload={application}
						workloadType="app"
						viewAllHref="/team/{teamSlug}/{environment}/app/{application}/activity-log"
					/>
				{/if}
				<Persistence workload={app} />
				{#if environment}
					<Configs {environment} workload={app?.name ?? ''} {teamSlug} />
					<Secrets workload={app?.name ?? ''} {environment} {teamSlug} />
				{/if}
			</div>
		</div>
		<Confirm bind:open={restart} onconfirm={submitRestart}>
			{#snippet header()}
				<Heading as="h2" size="medium">Restart {application}</Heading>
			{/snippet}
			This will restart all instances of
			<strong>{application}</strong> in
			<strong>{environment}</strong>.
			<br />
			Are you sure?
		</Confirm>
		<Confirm bind:open={stop} onconfirm={submitStop}>
			{#snippet header()}
				<Heading as="h2" size="medium">Stop {application}</Heading>
			{/snippet}
			This will stop
			<strong>{application}</strong> in
			<strong>{environment}</strong> by scaling replicas to 0.
			<br />
			The application will not receive any traffic until it is resized.
			<br /><br />
			Are you sure?
		</Confirm>
		<Modal bind:open={showManifest} closeButton width="medium">
			{#snippet header()}
				<Heading as="h2" size="small">Manifest &ndash; {application}</Heading>
			{/snippet}
			<Manifest workload={app} />
		</Modal>
		<PageModal content={ResizePage} header="Resize app" />
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

	.action-menu-button {
		all: unset;
		display: contents;
		cursor: pointer;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.app-content {
			grid-template-columns: 1fr;
		}
	}
</style>
