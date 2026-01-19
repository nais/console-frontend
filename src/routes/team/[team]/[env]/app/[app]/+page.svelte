<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import AggregatedCostForWorkload from '$lib/domain/cost/AggregatedCostForWorkload.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import Persistence from '$lib/domain/persistence/Persistence.svelte';
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
	import { Alert, Button, Heading, Loader } from '@nais/ds-svelte-community';
	import { ArrowCirclepathIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import Ingresses from './Ingresses.svelte';
	import Instances from './Instances.svelte';

	let { data }: PageProps = $props();
	let { App, AppInstances, teamSlug, userCanElevate } = $derived(data);

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
						{#if userCanElevate}
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
					<Heading as="h2" size="small">Vulnerabilities</Heading>
					<WorkloadVulnerabilitySummary workload={app} />
				</div>
				<SidebarActivity activityLog={app} direct={app.activityLog} />

				{#if environment}
					<Secrets workload={app.name} {environment} {teamSlug} />
				{/if}
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

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.workload-deploy-wrapper {
		margin-top: -2rem;
		padding-bottom: var(--spacing-layout);
	}
</style>
