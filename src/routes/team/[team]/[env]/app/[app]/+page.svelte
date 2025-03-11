<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql, type WorkloadStatusErrorLevel$options } from '$houdini';
	import AggregatedCostForWorkload from '$lib/components/AggregatedCostForWorkload.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import Image from '$lib/components/Image.svelte';
	import NetworkPolicy from '$lib/components/NetworkPolicy.svelte';
	import Persistence from '$lib/components/persistence/Persistence.svelte';
	import Secrets from '$lib/components/Secrets.svelte';
	import WorkloadDeploy from '$lib/components/WorkloadDeploy.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, BodyLong, BodyShort, Button, Heading } from '@nais/ds-svelte-community';
	import { ArrowCirclepathIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$houdini';
	import Ingresses from './Ingresses.svelte';
	import Instances from './Instances.svelte';
	import Utilization from './Utilization.svelte';

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

	const levelVariant = (level?: WorkloadStatusErrorLevel$options) => {
		switch (level) {
			case 'ERROR':
				return 'error';
			case 'WARNING':
				return 'warning';
			case 'TODO':
			default:
				return 'info';
		}
	};
</script>

<GraphErrors errors={$App.errors} />

{#if $App.data}
	{@const app = $App.data.team.environment.application}

	<div class="wrapper">
		<div class="app-content">
			<div class="main-section">
				{#if app.status.errors.some((error) => error.__typename === 'WorkloadStatusInvalidNaisYaml')}
					<Alert
						variant={levelVariant(
							app.status.errors.find(
								(error) => error.__typename === 'WorkloadStatusInvalidNaisYaml'
							)?.level
						)}
					>
						<div style="display: grid; gap: var(--a-spacing-3);">
							<Heading level="2" size="small">Rollout Failed - Invalid Manifest</Heading>
							<BodyLong>
								The rollout of your application has failed due to an error in the application
								manifest.
							</BodyLong>

							<Heading level="3" size="xsmall">Error details</Heading>

							<code style="font-size: 0.8rem; line-height: 1.75;"
								>{app.status.errors.find(
									(error) => error.__typename === 'WorkloadStatusInvalidNaisYaml'
								)?.detail}</code
							>

							<BodyLong>
								To resolve this issue, review the application manifest and correct any errors.
								Consult the <a
									target="_blank"
									rel="noopener noreferrer"
									href={docURL('/workloads/application/reference/application-spec/')}
									>Nais application reference</a
								> for manifest requirements.
							</BodyLong>
						</div>
					</Alert>
				{/if}
				{#if app.status.errors.some((error) => error.__typename === 'WorkloadStatusSynchronizationFailing')}
					<Alert
						variant={levelVariant(
							app.status.errors.find(
								(error) => error.__typename === 'WorkloadStatusSynchronizationFailing'
							)?.level
						)}
					>
						<Heading level="2" size="small" spacing>Rollout Failed - Synchronization Error</Heading>
						<BodyLong spacing>
							The rollout of the application is failing, meaning it is not in sync with the latest
							deployment. This may be due to a misconfiguration or a temporary issue, so try again
							in a few minutes. If the problem persists, please contact the Nais team.
						</BodyLong>

						<Heading level="3" size="xsmall" spacing>Error details</Heading>

						<code style="font-size: 0.8rem; line-height: 1;"
							>{app.status.errors.find(
								(error) => error.__typename === 'WorkloadStatusSynchronizationFailing'
							)?.detail}</code
						>
					</Alert>
				{/if}
				{#if app.status.errors.some((error) => error.__typename === 'WorkloadStatusDeprecatedRegistry')}
					<Alert
						variant={levelVariant(
							app.status.errors.find(
								(error) => error.__typename === 'WorkloadStatusDeprecatedRegistry'
							)?.level
						)}
					>
						<BodyShort spacing
							>This application is using a deprecated image registry ({app.status.errors.find(
								(error) => error.__typename === 'WorkloadStatusDeprecatedRegistry'
							)?.registry}).</BodyShort
						>

						<BodyLong
							>Starting April 1st, applications and jobs on Nais must use images from Google
							Artifact Registry (GAR). The easiest way to ensure that images are stored in GAR is to
							use Nais' GitHub Actions in the workflow. <a
								href="https://nais.io/log/#2025-02-24-image-policy"
								target="_blank"
								rel="noopener noreferrer">Read more in Nais announcement</a
							>.
						</BodyLong>
					</Alert>
				{/if}

				{#if app.deletionStartedAt}
					<Alert variant="info" size="small" fullWidth={false}>
						This application is being deleted. Deletion started <Time
							time={app.deletionStartedAt}
							distance
						/>. If the deletion is taking too long, please contact the Nais team.
					</Alert>
				{/if}

				<div style="display:flex; flex-direction: column; gap: var(--a-spacing-4);">
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
					<Instances {app} />
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
				<!-- <Status {app} /> -->
				<AggregatedCostForWorkload workload={app.name} {environment} {teamSlug} />
				<Image workload={app} />
				<Utilization {app} />
				<WorkloadDeploy workload={app} />
				{#if viewerIsMember}
					<Secrets workload={app.name} {environment} {teamSlug} />
				{/if}
			</div>
		</div>
		<Confirm bind:open={restart} onconfirm={submit}>
			{#snippet header()}
				<h3>Restart {application}</h3>
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
