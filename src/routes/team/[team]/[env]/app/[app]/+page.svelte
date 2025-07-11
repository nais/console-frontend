<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import SidebarActivity from '$lib/components/activity/SidebarActivity.svelte';
	import AggregatedCostForWorkload from '$lib/components/AggregatedCostForWorkload.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import ErrorMessage, { supportedErrorTypes } from '$lib/components/errors/ErrorMessage.svelte';
	import NetworkPolicy from '$lib/components/NetworkPolicy.svelte';
	import Persistence from '$lib/components/persistence/Persistence.svelte';
	import Secrets from '$lib/components/Secrets.svelte';
	import WorkloadVulnerabilitySummary from '$lib/components/vulnerability/WorkloadVulnerabilitySummary.svelte';
	import WorkloadDeploy from '$lib/components/WorkloadDeploy.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Alert, Button, Heading, Loader } from '@nais/ds-svelte-community';
	import { ArrowCirclepathIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import Ingresses from './Ingresses.svelte';
	import Instances from './Instances.svelte';

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

	const submit = () => {
		restartApp.mutate({
			application,
			environment,
			team: teamSlug
		});
	};

	let after: string = $derived($App.variables?.after ?? '');
	let before: string = $derived($App.variables?.before ?? '');

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after
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
				{#if app.status.errors.filter( (e) => supportedErrorTypes.some((errorType) => errorType === e.__typename) ).length}
					<div style="display: flex; flex-direction: column; gap: var(--ax-space-8);">
						{#each app.status.errors as error, i (i)}
							{#if supportedErrorTypes.some((errorType) => errorType === error.__typename)}
								<ErrorMessage
									{error}
									instances={app.instances.edges}
									{docURL}
									workloadType="App"
									{teamSlug}
									workloadName={app.name}
									environment={app.teamEnvironment.environment.name}
								/>
							{/if}
						{/each}
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

				<div style="display:flex; flex-direction: column; gap: var(--ax-space-16);">
					<div class="instances-header">
						<Heading level="3" size="medium">Instances</Heading>
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
					<Instances app={$App.data} />
					<Pagination
						page={$App.data?.team.environment.application.instances.pageInfo}
						loaders={{
							loadPreviousPage: () => {
								changeQuery({
									after: '',
									before:
										$App.data?.team.environment.application.instances.pageInfo.startCursor ?? ''
								});
							},
							loadNextPage: () => {
								changeQuery({
									before: '',
									after: $App.data?.team.environment.application.instances.pageInfo.endCursor ?? ''
								});
							}
						}}
					/>
				</div>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1rem;">
					<div>
						<Ingresses {app} />
					</div>
					<div>
						<Persistence workload={app} />
					</div>
				</div>

				<div>
					<NetworkPolicy workload={app} />
				</div>
			</div>
			<div class="sidebar">
				<AggregatedCostForWorkload workload={app.name} {environment} {teamSlug} />
				<div>
					<Heading level="2" size="small">Vulnerabilities</Heading>
					<WorkloadVulnerabilitySummary workload={app} />
				</div>
				<SidebarActivity activityLog={app} />

				<WorkloadDeploy workload={app} />
				{#if viewerIsMember}
					<Secrets workload={app.name} {environment} {teamSlug} />
				{/if}
			</div>
		</div>
		<Confirm bind:open={restart} onconfirm={submit}>
			{#snippet header()}
				<Heading level="1" size="medium">Restart {application}</Heading>
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
</style>
