<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import AggregatedCostForWorkload from '$lib/domain/cost/AggregatedCostForWorkload.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import Persistence from '$lib/domain/persistence/Persistence.svelte';
	import Configs from '$lib/domain/resources/Configs.svelte';
	import NetworkPolicy from '$lib/domain/resources/NetworkPolicy.svelte';
	import Secrets from '$lib/domain/resources/Secrets.svelte';
	import WorkloadDeploy from '$lib/domain/workload/WorkloadDeploy.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Alert, Button, Heading, Loader, Tag } from '@nais/ds-svelte-community';
	import { ArrowCirclepathIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import Ingresses from './Ingresses.svelte';
	import RunningIndicator from '$lib/ui/RunningIndicator.svelte';
	import IncomingIndicator from '$lib/ui/IncomingIndicator.svelte';

	let { data }: PageProps = $props();
	let { App, teamSlug, viewerIsMember } = $derived(data);

	const instanceGroups = $derived($App.data?.team.environment.application.instanceGroups ?? []);

	// The newest group that isn't fully running is "incoming" (a rollout in progress).
	// Everything else is "current". If there's only one group, it's always current.
	const incoming = $derived(
		instanceGroups.length > 1
			? instanceGroups.reduce((newest, g) =>
					new Date(g.created) > new Date(newest.created) ? g : newest
				)
			: null
	);

	function groupRole(group: (typeof instanceGroups)[number]) {
		if (incoming && group.id === incoming.id) return 'incoming';
		return 'current';
	}

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
					{#each app.instanceGroups as group (group.id)}
						{@const role = groupRole(group)}
						{@const hasFailing = group.instances.some((i) => i.status.state === 'FAILING')}
						{@const hasWarning = group.events.some((e) => e.severity === 'WARNING')}
						<a
							href="/team/{app.team.slug}/{app.teamEnvironment.environment
								.name}/app/{app.name}/instancegroup/{group.name}"
							class="instance-group-link"
							class:incoming={role === 'incoming'}
						>
							{#if role === 'incoming'}
								<IncomingIndicator />
							{:else}
								<RunningIndicator />
							{/if}
							<div class="instance-group-info">
								<span class="instance-group-status">
									{group.readyInstances}/{group.desiredInstances} running
								</span>
								<span class="instance-group-meta">
									{group.image.tag} &middot; Updated <Time time={group.created} distance />
								</span>
							</div>
							{#if hasFailing}
								<Tag size="small" variant="error">Failing</Tag>
							{/if}
							{#if hasWarning && !hasFailing}
								<Tag size="small" variant="warning">Warning</Tag>
							{/if}
							{#if incoming}
								{#if role === 'incoming'}
									<Tag size="small" variant="alt1">Incoming</Tag>
								{:else}
									<Tag size="small" variant="neutral">Current</Tag>
								{/if}
							{/if}
						</a>
					{/each}
				</div>
				<Ingresses app={$App.data} />

				<NetworkPolicy workload={app} />
				<Persistence workload={app} />
			</div>
			<div class="sidebar">
				{#if environment}
					<AggregatedCostForWorkload workload={app.name} {environment} {teamSlug} />
				{/if}
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
		border-radius: var(--ax-border-radius-medium);
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
	}

	.instance-group-status {
		font-weight: var(--ax-font-weight-bold);
	}

	.instance-group-meta {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}
</style>
