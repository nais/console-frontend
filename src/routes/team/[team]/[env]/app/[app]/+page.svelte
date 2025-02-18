<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import AggregatedCostForWorkload from '$lib/components/AggregatedCostForWorkload.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import Image from '$lib/components/Image.svelte';
	import NetworkPolicy from '$lib/components/NetworkPolicy.svelte';
	import Persistence from '$lib/components/Persistence.svelte';
	import Secrets from '$lib/components/Secrets.svelte';
	import WorkloadDeploy from '$lib/components/WorkloadDeploy.svelte';
	import { BodyShort, Button, Heading } from '@nais/ds-svelte-community';
	import { ArrowCirclepathIcon, PackageIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import Ingresses from './Ingresses.svelte';
	import Instances from './Instances.svelte';
	import Status from './Status.svelte';
	import Utilization from './Utilization.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { App, teamSlug } = $derived(data);

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
</script>

{#if $App.data}
	{@const app = $App.data.team.environment.application}
	<div class="wrapper">
		<!-- <PageHeader
			breadcrumbs={urlToBreadcrumbs(page.url)}
			heading={application}
			subheading={environment}
		/> -->
		<div class="header">
			<PackageIcon style="font-size: 2.5rem" />
			<div>
				<Heading level="2" size="xlarge">{application}</Heading>
				<BodyShort>{environment}</BodyShort>
			</div>
		</div>
		<div class="app-content">
			<div class="main-section">
				<div style="display:flex; flex-direction: column; gap:0.5rem;">
					<div class="instances-header">
						<Heading level="3" size="medium">Instances</Heading>
						{#if $App.data.team.viewerIsMember || $App.data.team.viewerIsOwner}
							<Button
								variant="secondary"
								size="small"
								onclick={() => (restart = true)}
								icon={ArrowCirclepathIcon}
							>
								Restart app
							</Button>
						{/if}
					</div>
					<Instances {app} />
				</div>
				<div
					style="display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem; margin-bottom: 1rem;"
				>
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
				<Status {app} />
				<Utilization {app} />
				<WorkloadDeploy workload={app} />
				<Image workload={app} />
				<AggregatedCostForWorkload workload={app.name} {environment} {teamSlug} />
				{#if $App.data.team.viewerIsMember || $App.data.team.viewerIsOwner}
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
		gap: var(--a-spacing-12);
	}

	.main-section {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-12);
	}

	.header {
		display: flex;
		align-items: center;
		gap: var(--a-spacing-4);
	}

	.app-content {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--a-spacing-12);
	}

	.instances-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-10);
	}
</style>
