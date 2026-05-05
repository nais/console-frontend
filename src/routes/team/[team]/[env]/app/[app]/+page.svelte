<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import LatestActivity from '$lib/domain/activity/workload/LatestActivity.svelte';
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
	import { Alert, Button, Heading, Loader } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuItem } from '@nais/ds-svelte-community/experimental';
	import {
		ArrowCirclepathIcon,
		MenuElipsisVerticalIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import Ingresses from './Ingresses.svelte';
	import InstanceGroups from './InstanceGroups.svelte';

	let { data }: PageProps = $props();
	let { App, teamSlug, viewerIsMember } = $derived(data);

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

	const openRestart = () => {
		restart = true;
	};

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
						<ActionMenu>
							{#snippet trigger(props)}
								<Button
									variant="tertiary-neutral"
									size="small"
									icon={MenuElipsisVerticalIcon}
									{...props}
								>
									Actions
								</Button>
							{/snippet}
							<button
								class="action-menu-button"
								onclick={openRestart}
								disabled={app.deletionStartedAt !== null}
							>
								<ActionMenuItem
									icon={ArrowCirclepathIcon}
									disabled={app.deletionStartedAt !== null}
								>
									Restart app
								</ActionMenuItem>
							</button>
							<a
								class="action-menu-button"
								href="/team/{page.params.team}/{page.params.env}/app/{page.params.app}/delete"
							>
								<ActionMenuItem icon={TrashIcon} variant="danger">Delete app</ActionMenuItem>
							</a>
						</ActionMenu>
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
				<InstanceGroups {app} />
				<div>
					<Ingresses app={$App.data} />
				</div>
				<div>
					<NetworkPolicy workload={app} />
				</div>
				<div>
					<Persistence workload={app} />
				</div>
				{#if environment}
					<Configs {environment} workload={app.name} {teamSlug} />
					<Secrets workload={app.name} {environment} {teamSlug} />
				{/if}
			</div>
			<div class="sidebar">
				<WorkloadDeploy workload={app} />
				<LatestActivity
					activityLog={app}
					href="/team/{page.params.team}/{page.params.env}/app/{page.params.app}/activity-log"
				/>
				{#if environment}
					<AggregatedCostForWorkload workload={app.name} {environment} {teamSlug} />
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

	.detail-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--ax-space-8);
		flex-wrap: wrap;
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

		.detail-actions :global(button),
		.detail-actions :global(a) {
			width: 100%;
		}
	}
</style>
