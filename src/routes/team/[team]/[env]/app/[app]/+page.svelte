<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import { Alert, Button } from '@nais/ds-svelte-community';
	import { ArrowCirclepathIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import Authentications from './Authentications.svelte';
	import Image from './Image.svelte';
	import Instances from './Instances.svelte';
	import Persistence from './Persistence.svelte';
	import Scaling from './Scaling.svelte';
	import Secrets from './Secrets.svelte';
	import Status from './Status.svelte';
	import Traffic from './Traffic.svelte';
	import Utilization from './Utilization.svelte';

	export let data: PageData;
	$: ({ App } = data);

	const restartAppMutation = () =>
		graphql(`
			mutation RestartApp($team: Slug!, $env: String!, $app: String!) {
				restartApp(team: $team, env: $env, name: $app) {
					error
				}
			}
		`);
	let restartApp = restartAppMutation();
	onNavigate(() => {
		restartApp = restartAppMutation();
	});

	$: app = $page.params.app;
	$: env = $page.params.env;
	$: team = $page.params.team;
	let restart = false;

	const submit = () => {
		restartApp.mutate({
			app,
			env,
			team
		});
	};
</script>

{#if $App.data}
	<div class="grid">
		<Status app={$App.data.app} />
		<Card columns={4}>
			<Image app={$App.data.app} />
		</Card>
		<Card columns={4} rows={1}>
			<Cost {app} {env} {team} />
		</Card>
		<Card columns={12}>
			<div class="heading">
				<h4>Instances</h4>
				{#if $App.data.team.viewerIsMember || $App.data.team.viewerIsOwner}
					<Button
						variant="secondary"
						size="small"
						on:click={() => {
							restart = true;
						}}
					>
						<svelte:fragment slot="icon-left"><ArrowCirclepathIcon /></svelte:fragment>
						Restart
					</Button>
				{/if}
			</div>
			{#if $restartApp.data}
				<div class="marginbox">
					{#if !$restartApp.data.restartApp.error}
						<Alert size="small" variant="success">All instances restarting</Alert>
					{:else}
						<Alert size="small" variant="error">{$restartApp.data.restartApp.error}</Alert>
					{/if}
				</div>
			{/if}
			<div class="utilAndScaling">
				<Utilization app={$App.data.app} />

				<Scaling app={$App.data.app} />
			</div>

			<Instances app={$App.data.app} />
		</Card>
		<Card columns={12}>
			<h4>Traffic policies</h4>
			<Traffic app={$App.data.app} />
		</Card>
		<Card columns={4}>
			<h4>Persistence</h4>
			<Persistence persistence={$App.data.app.persistence} />
		</Card>
		<Card columns={4}>
			<h4>Authentications</h4>
			<Authentications app={$App.data.app} />
		</Card>
		{#if $App.data.team.viewerIsMember || $App.data.team.viewerIsOwner}
			<Card columns={4}>
				<h4>Secrets</h4>
				<Secrets />
			</Card>
		{/if}
	</div>
	<Confirm bind:open={restart} on:confirm={submit}>
		<h3 slot="header">Restart {app}</h3>
		This will restart all instances of<strong>{app}</strong> in <strong>{env}</strong>.
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
