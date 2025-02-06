<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import AggregatedCostForWorkload from '$lib/components/AggregatedCostForWorkload.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import Image from '$lib/components/Image.svelte';
	import Persistence from '$lib/components/Persistence.svelte';
	import Traffic from '$lib/components/Traffic.svelte';
	import { Alert, Button } from '@nais/ds-svelte-community';
	import { ArrowCirclepathIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import Authentications from './Authentications.svelte';
	import Instances from './Instances.svelte';
	import Scaling from './Scaling.svelte';
	import Secrets from './Secrets.svelte';
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
	<div class="grid">
		<Status {app} />

		<Card columns={4}>
			<Image workload={app} />
		</Card>
		<Card columns={4} rows={1}>
			<AggregatedCostForWorkload {teamSlug} workload={application} {environment} />
		</Card>
		<Card columns={12}>
			<div class="heading">
				<h4>Instances</h4>
				{#if $App.data.team.viewerIsMember || $App.data.team.viewerIsOwner}
					<Button
						variant="secondary"
						size="small"
						onclick={() => {
							restart = true;
						}}
						icon={ArrowCirclepathIcon}
					>
						Restart
					</Button>
				{/if}
			</div>
			{#if $restartApp.data}
				<div class="marginbox">
					{#if !$restartApp.errors}
						<Alert size="small" variant="success">All instances restarting</Alert>
					{:else}
						{#each $restartApp.errors as error}
							<Alert size="small" variant="error">{error.message}</Alert>
						{/each}
					{/if}
				</div>
			{/if}
			<div class="utilAndScaling">
				<Utilization {app} />

				<Scaling {app} />
			</div>

			<Instances {teamSlug} {app} />
		</Card>
		<Card columns={12}>
			<h4>Traffic policies</h4>
			<Traffic workload={app} />
		</Card>
		<Card columns={4}>
			<Persistence workload={app} />
		</Card>
		<Card columns={4}>
			<h4>Authentications</h4>
			<Authentications {app} />
		</Card>
		{#if $App.data.team.viewerIsMember || $App.data.team.viewerIsOwner}
			<Card columns={4}>
				<h4>Secrets</h4>
				<Secrets />
			</Card>
		{/if}
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
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	h4 {
		font-weight: 400;
		margin-bottom: 0.5rem;
	}
	.heading {
		display: flex;
		justify-content: space-between;
	}
	.marginbox {
		margin: 0.5rem 0;
	}
	.utilAndScaling {
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		margin: 1rem 0;
	}
</style>
