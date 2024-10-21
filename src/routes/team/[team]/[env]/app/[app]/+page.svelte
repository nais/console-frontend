<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import AppCost from '$lib/components/AppCost.svelte';
	import type { PageData } from './$houdini';
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

	/*const restartAppMutation = () =>
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
	});*/

	$: application = $page.params.app;
	$: environment = $page.params.env;
	$: team = $page.params.team;

	console.log(application, environment, team);
	//let restart = false;

	/*const submit = () => {
		restartApp.mutate({
			app,
			env,
			team
		});
	};*/
</script>

{#if $App.data}
	{@const app = $App.data.team.environment.application}
	<div class="grid">
		<Status {app} />

		<Card columns={4}>
			<Image workload={app} />
		</Card>
		<Card columns={4} rows={1}>
			<AppCost {team} {application} {environment} />
		</Card>
		<Card columns={12}>
			<div class="heading">
				<h4>Instances</h4>
				<!--{#if app.viewerIsMember || app.viewerIsOwner}
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
				{/if}-->
			</div>
			<!--{#if $restartApp.data}
				<div class="marginbox">
					{#if !$restartApp.data.restartApp.error}
						<Alert size="small" variant="success">All instances restarting</Alert>
					{:else}
						<Alert size="small" variant="error">{$restartApp.data.restartApp.error}</Alert>
					{/if}
				</div>
			{/if}-->
			<div class="utilAndScaling">
				<Utilization {app} />

				<Scaling {app} />
			</div>

			<Instances {app} />
		</Card>
		<Card columns={12}>
			<h4>Traffic policies</h4>
			<Traffic {app} />
		</Card>
		<Card columns={4}>
			<h4>Persistence</h4>
			<Persistence {app} />
		</Card>
		<Card columns={4}>
			<h4>Authentications</h4>
			<!--Authentications app={$App.data.app} /-->
			TODO: Authentications
		</Card>
		{#if $App.data.team.viewerIsMember || $App.data.team.viewerIsOwner}
			<Card columns={4}>
				<h4>Secrets</h4>
				<Secrets />
			</Card>
		{/if}
	</div>
	<!--Confirm bind:open={restart} on:confirm={submit}>
		<h3 slot="header">Restart {app}</h3>
		This will restart all instances of<strong>{app}</strong> in <strong>{env}</strong>.
		<br />
		Are you sure?
	</Confirm-->
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
	/*.marginbox {
		margin: 0.5rem 0;
	}*/
	.utilAndScaling {
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		margin: 1rem 0;
	}
</style>
