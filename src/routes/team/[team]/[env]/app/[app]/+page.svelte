<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql, StaleSeverity } from '$houdini';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import AggregatedCostForWorkload from '$lib/domain/cost/AggregatedCostForWorkload.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import Persistence from '$lib/domain/persistence/Persistence.svelte';
	import Configs from '$lib/domain/resources/Configs.svelte';
	import NetworkPolicy from '$lib/domain/resources/NetworkPolicy.svelte';
	import Secrets from '$lib/domain/resources/Secrets.svelte';
	import WorkloadVulnerabilitySummary from '$lib/domain/vulnerability/WorkloadVulnerabilitySummary.svelte';
	import WorkloadDeploy from '$lib/domain/workload/WorkloadDeploy.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Alert, Button, Heading, Loader, Tag, Tooltip } from '@nais/ds-svelte-community';
	import {
		ArrowCirclepathIcon,
		ExclamationmarkTriangleFillIcon,
		ShieldCheckmarkIcon,
		ShieldIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import Ingresses from './Ingresses.svelte';
	import Instances from './Instances.svelte';

	let { data }: PageProps = $props();
	let { App, AppInstances, teamSlug, viewerIsMember } = $derived(data);

	const restartAppMutation = () =>
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
		`);
	let restartApp = $state(restartAppMutation());

	onNavigate(() => {
		restartApp = restartAppMutation();
	});

	let application = $derived(page.params.app);
	let environment = $derived(page.params.env);

	let restart = $state(false);

	const submit = () => {
		if (!application || !environment) {
			console.error('Application or environment is not defined');
			return;
		}
		restartApp.mutate({
			application,
			environment,
			team: teamSlug
		});
	};

	let after: string = $derived($AppInstances.variables?.after ?? '');
	let before: string = $derived($AppInstances.variables?.before ?? '');

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams(
			{
				before: params.before ?? before,
				after: params.after ?? after
			},
			{ noScroll: true }
		);
	};
</script>

{#if $App.data}
	{@const app = $App.data.team.environment.application}
	<div class="workload-deploy-wrapper">
		<WorkloadDeploy workload={app} />
	</div>
{/if}

<GraphErrors errors={$App.errors} />

{#if $App.fetching}
	<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
		<Loader size="3xlarge" />
	</div>
{/if}
{#if $App.data}
	{@const app = $App.data.team.environment.application}

	<div class="wrapper">
		<div class="app-content">
			<div class="main-section">
				{#if viewerIsMember}
					<div class="detail-actions">
						<Button
							as="a"
							variant="danger"
							size="small"
							href="/team/{page.params.team}/{page.params.env}/app/{page.params.app}/delete"
							icon={TrashIcon}
						>
							Delete
						</Button>
					</div>
				{/if}
				{#if app.deletionStartedAt}
					<Alert variant="info" size="small" fullWidth={false}>
						This application is being deleted. Deletion started <Time
							time={app.deletionStartedAt}
							distance
						/>. If the deletion is taking too long, contact the Nais team.
					</Alert>
				{/if}
				{#if $App.data.team.environment.application.issues.edges.length > 0}
					<div>
						<Heading as="h3" spacing>Issues</Heading>
						<List>
							{#each $App.data.team.environment.application.issues.edges as edge (edge.node.id)}
								<IssueListItem item={edge.node} />
							{/each}
						</List>
					</div>
				{/if}
				<div style="display:flex; flex-direction: column; gap: var(--ax-space-16);">
					<div class="instances-header">
						<Heading as="h3" size="medium">Instances</Heading>
						{#if viewerIsMember}
							<Button
								variant="secondary"
								size="small"
								onclick={() => (restart = true)}
								icon={ArrowCirclepathIcon}
								disabled={app.deletionStartedAt !== null}
							>
								Restart app
							</Button>
						{/if}
					</div>
					<Instances app={$App.data} instances={$AppInstances.data} />
					<Pagination
						page={$AppInstances.data?.team.environment.application.instances.pageInfo}
						loaders={{
							loadPreviousPage: () => {
								changeQuery({
									after: '',
									before:
										$AppInstances.data?.team.environment.application.instances.pageInfo
											.startCursor ?? ''
								});
							},
							loadNextPage: () => {
								changeQuery({
									before: '',
									after:
										$AppInstances.data?.team.environment.application.instances.pageInfo.endCursor ??
										''
								});
							}
						}}
					/>
				</div>
				<div>
					<Ingresses app={$App.data} />
				</div>

				<div>
					<NetworkPolicy workload={app} />
				</div>
				<div>
					<Persistence workload={app} />
				</div>
			</div>
			<div class="sidebar">
				{#if environment}
					<AggregatedCostForWorkload workload={app.name} {environment} {teamSlug} />
				{/if}
				<div>
					<div style="display: flex; align-items: center; gap: var(--ax-space-4);">
						<Heading as="h2" size="small">Vulnerabilities</Heading>
						{#if app.image.staleness.severity === StaleSeverity.STALE_PROCESSING}
							<Tooltip content={app.image.staleness.reason}>
								<Loader size="xsmall" />
							</Tooltip>
						{:else if app.image.staleness.severity === StaleSeverity.STALE_PERMANENT}
							<Tooltip content={app.image.staleness.reason}>
								<ExclamationmarkTriangleFillIcon
									style="color: var(--ax-text-warning); font-size: 1.25rem;"
								/>
							</Tooltip>
						{:else if app.image.hasSBOM && app.image.vulnerabilitySummary}
							<Tooltip content={app.image.staleness.reason}>
								<ShieldCheckmarkIcon
									style="color: var(--ax-text-success-decoration); font-size: 1.25rem;"
								/>
							</Tooltip>
						{:else}
							<Tooltip content="No SBOM registered">
								<ShieldIcon style="color: var(--ax-text-subtle); font-size: 1.25rem;" />
							</Tooltip>
						{/if}
					</div>
					<WorkloadVulnerabilitySummary workload={app} />
				</div>
				{#if environment}
					<Configs {environment} workload={app.name} {teamSlug} />
					<Secrets workload={app.name} {environment} {teamSlug} />
				{/if}
				<SidebarActivity activityLog={app} direct={app.activityLog} />
			</div>
		</div>
		<Confirm bind:open={restart} onconfirm={submit}>
			{#snippet header()}
				<Heading as="h1" size="medium">Restart {application}</Heading>
			{/snippet}
			This will restart all instances of
			<strong>{application}</strong> in
			<strong>{environment}</strong>.
			<br />
			Are you sure?
		</Confirm>
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

	.instances-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.detail-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--ax-space-8);
		flex-wrap: wrap;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.workload-deploy-wrapper {
		margin-top: -2rem;
		padding-bottom: var(--spacing-layout);
	}
	.instance-group-link {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
		padding: var(--ax-space-12) var(--ax-space-16);
		border: 1px solid var(--ax-border-neutral);
		border-radius: var(--ax-radius-8);
		text-decoration: none;
		color: inherit;
	}

	.instance-group-link:hover {
		background-color: var(--ax-bg-neutral-moderate-hover);
	}

	.instance-group-link.incoming {
		border-style: dashed;
	}

	.instance-group-info {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
		flex: 1;
		min-width: 0;
	}

	.instance-group-status {
		font-weight: var(--ax-font-weight-bold);
	}

	.instance-group-meta {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
		overflow-wrap: anywhere;
	}

	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.app-content {
			grid-template-columns: 1fr;
		}

		.workload-deploy-wrapper {
			margin-top: 0;
		}

		.detail-actions :global(button),
		.detail-actions :global(a) {
			width: 100%;
		}

		.instances-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--ax-space-12);
		}

		.instance-group-link {
			flex-wrap: wrap;
			align-items: flex-start;
		}

		.instances-header :global(button) {
			width: 100%;
		}
	}
</style>
