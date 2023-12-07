<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { PendingValue, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Button, CopyButton, Modal, Skeleton } from '@nais/ds-svelte-community';
	import { ArrowsCirclepathIcon, EyeIcon, EyeSlashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	const rotateKey = graphql(`
		mutation RotateDeployKey($team: String!) {
			changeDeployKey(team: $team) {
				key
				created
				expires
			}
		}
	`);

	$: hookdResponse = graphql(`
		query HookdDeployKey($team: String!) @load {
			team(name: $team) @loading(cascade: true) {
				id
				deployKey {
					key
					created
					expires
				}
			}
		}
	`);

	export let data: PageData;

	$: ({ TeamSettings } = data);

	$: teamSettings = $TeamSettings.data?.team;

	$: team = $page.params.team;

	let showKey = false;
	let showRotateKey = false;
</script>

{#if $TeamSettings.errors}
	<Alert variant="error">
		{#each $TeamSettings.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if teamSettings}
	<div style="margin-bottom: 1rem;">
		<Alert variant="info">
			Team settings currently managed by <a href="https://teams.nav.cloud.nais.io">Teams</a>
			<br />
			This functionality will be incorporated into this app eventually
		</Alert>
	</div>
	<div class="grid">
		<Card columns={6}>
			<h3>{team}</h3>
			{#if teamSettings.id === PendingValue}
				<Skeleton variant="text" width="400px" />
			{:else}
				<i>{teamSettings.description}</i>
			{/if}
			<h4>Slack channels</h4>
			{#if teamSettings.slackChannel !== PendingValue && teamSettings.slackChannel !== ''}
				<dl>
					<dt>Default slack-channel:</dt>
					<dd>{teamSettings.slackChannel}</dd>
				</dl>
			{/if}
			{#if teamSettings.slackAlertsChannels && teamSettings.slackAlertsChannels.length > 0 && teamSettings.slackAlertsChannels[0].env !== PendingValue}
				<dl>
					<dh>Per-environment slack-channels to be used for alerts sent by the platform.</dh>
					{#each teamSettings.slackAlertsChannels as channel}
						<dt>{channel.env}:</dt>
						<dd>{channel.name}</dd>
					{/each}
				</dl>
			{/if}
		</Card>
		<Card columns={6}>
			<h3>Managed resources</h3>
			{#if teamSettings.gcpProjects.length > 0 && teamSettings.gcpProjects[0].environment !== PendingValue}
				{#each teamSettings.gcpProjects as project}
					{#if project.environment !== 'ci-gcp'}
						<dl>
							<dt>GCP project ID ({project.environment}):</dt>
							<dd>{project.id}</dd>
						</dl>
					{/if}
				{/each}
			{/if}
			<!--p>GitHub repositories:</p>

			{#each teamSettings.githubRepositories.edges as repo}
				{repo.node.name}<br />
			{/each}-->
		</Card>
		<Card columns={12}>
			<h3>Deploy key</h3>

			{#if $hookdResponse.data?.team}
				{@const deployKey = $hookdResponse.data.team.deployKey}
				<dl>
					<dt>Created:</dt>
					{#if deployKey.key === PendingValue}
						<dd><Skeleton variant="text" /></dd>
					{:else}
						<dd><Time time={deployKey.created} distance={true} /></dd>
					{/if}
					<dt>Expires:</dt>
					{#if deployKey.expires === PendingValue}
						<dd><Skeleton variant="text" /></dd>
					{:else}
						<dd><Time time={deployKey.expires} distance={true} /></dd>
					{/if}
					<dt>Key:</dt>
					<dd>
						<div class="deployKey">
							{#if showKey}
								{deployKey.key}
								<Button
									size="xsmall"
									variant="tertiary"
									on:click={() => {
										showKey = !showKey;
									}}
								>
									<svelte:fragment slot="icon-left"><EyeSlashIcon /></svelte:fragment></Button
								>
							{:else}
								{#if deployKey.key === PendingValue}
									<dd><Skeleton variant="text" /></dd>
								{:else}
									{deployKey.key.replaceAll(/./g, '*')}
								{/if}
								<Button
									size="xsmall"
									variant="tertiary"
									on:click={() => {
										showKey = !showKey;
									}}
								>
									<svelte:fragment slot="icon-left"><EyeIcon /></svelte:fragment></Button
								>
							{/if}
						</div>
					</dd>
				</dl>
				<div class="buttons">
					<div class="button">
						<CopyButton
							text="Copy key"
							activeText="Key copied"
							variant="action"
							copyText={deployKey.key === PendingValue ? '' : deployKey.key}
							size="small"
						/>
					</div>
					<div class="button">
						<Button
							size="small"
							variant="danger"
							on:click={() => {
								showRotateKey = !showRotateKey;
							}}
						>
							<svelte:fragment slot="icon-left"><ArrowsCirclepathIcon /></svelte:fragment>
							Rotate key</Button
						>
					</div>
				</div>
			{:else}
				<Alert variant="error">Error getting deploy key. Please try again later.</Alert>
			{/if}
		</Card>
		{#if browser}
			<Modal bind:open={showRotateKey} closeButton={false}>
				<h3>Rotate deploy key</h3>
				<p>Are you sure you want to rotate the deploy key?</p>
				<Button
					on:click={() => {
						showRotateKey = !showRotateKey;
					}}
				>
					Cancel</Button
				>
				<Button
					variant="danger"
					on:click={() => {
						showRotateKey = !showRotateKey;
						rotateKey.mutate({ team });
					}}
				>
					Rotate key</Button
				>
			</Modal>
		{/if}
	</div>
{/if}

<style>
	dl {
		display: block;
		margin-block-start: 1em;
		margin-block-end: 1em;
		margin-inline-start: 0px;
		margin-inline-end: 0px;
	}
	dt {
		font-weight: bold;
	}
	dd {
		margin-inline-start: 40px;
		font-family: monospace;
		font-size: 1rem;
	}
	.deployKey {
		font-family: monospace;
		padding-bottom: 1rem;
	}
	h3 {
		margin-bottom: 0.5rem;
	}
	h4 {
		margin: 0.8rem 0rem;
	}
	i {
		margin-bottom: 0.5rem;
	}
	.buttons {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}
	.button {
		width: 130px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
