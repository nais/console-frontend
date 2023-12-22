<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { PendingValue, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Button, CopyButton, Loader, Modal, Skeleton } from '@nais/ds-svelte-community';
	import {
		ArrowsCirclepathIcon,
		ChatExclamationmarkIcon,
		EyeIcon,
		EyeSlashIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import EditText from './EditText.svelte';

	export let data: PageData;

	const rotateKey = graphql(`
		mutation RotateDeployKey($team: String!) {
			changeDeployKey(team: $team) {
				key
				created
				expires
			}
		}
	`);

	const updateTeam = graphql(`
		mutation UpdateTeam($slug: Slug!, $input: UpdateTeamInput!) {
			updateTeam(slug: $slug, input: $input) {
				purpose
				slackChannel
				slackAlertsChannels {
					channelName
					environment
				}
			}
		}
	`);

	$: hookdResponse = graphql(`
		query HookdDeployKey($team: Slug!) @load {
			team(slug: $team) @loading(cascade: true) {
				id
				deployKey {
					key
					created
					expires
				}
			}
		}
	`);

	$: ({ TeamSettings } = data);

	$: teamSettings = $TeamSettings.data?.team;

	$: team = $page.params.team;

	let showKey = false;
	let showRotateKey = false;

	let descriptionError = false;
	let defaultSlackChannelError = false;
	let slackChannelsError = false;

	const formatGARRepo = (repo: string) => {
		const [, projectId, , location, , repository] = repo.split('/');
		return `${location}-docker.pkg.dev/${projectId}/${repository}`;
	};
</script>

{#if $TeamSettings.errors}
	<Alert variant="error">
		{#each $TeamSettings.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if teamSettings}
	<div class="grid">
		<Card columns={6}>
			<h3>{team}</h3>
			{#if teamSettings.id === PendingValue}
				<Skeleton variant="text" width="400px" />
			{:else}
				<i>
					<EditText
						text={teamSettings.purpose}
						on:save={async (e) => {
							descriptionError = false;
							const data = await updateTeam.mutate({
								slug: team,
								input: {
									purpose: e.detail
								}
							});

							if (data.errors) {
								descriptionError = true;
							}
						}}
					/>
				</i>

				{#if descriptionError}
					<Alert variant="error" size="small">
						Error updating description. Please try again later.
					</Alert>
				{/if}
			{/if}
			<h4><ChatExclamationmarkIcon /> Slack channels</h4>
			{#if teamSettings.slackChannel !== PendingValue && teamSettings.slackChannel !== ''}
				<p>
					<b>Default slack-channel:</b>
					<EditText
						text={teamSettings.slackChannel}
						variant="textfield"
						on:save={async (e) => {
							defaultSlackChannelError = false;
							const data = await updateTeam.mutate({
								slug: team,
								input: {
									slackChannel: e.detail
								}
							});

							if (data.errors) {
								defaultSlackChannelError = true;
							}
						}}
					/>
				</p>
				{#if defaultSlackChannelError}
					<Alert variant="error" size="small">
						Error updating default slack-channel. Please try again later.
					</Alert>
				{/if}
			{/if}
			{#if teamSettings.slackAlertsChannels && teamSettings.slackAlertsChannels.length > 0}
				<p>
					Per-environment slack-channels to be used for alerts sent by the platform.
					{#each teamSettings.slackAlertsChannels as channel}
						{#if channel !== PendingValue}
							<div class="channel">
								<b>{channel.environment}:</b>
								<EditText
									text={channel.channelName}
									variant="textfield"
									on:save={async (e) => {
										slackChannelsError = false;
										if (!teamSettings) {
											return;
										}

										const updates = teamSettings.slackAlertsChannels.map((c) => {
											if (c === PendingValue || channel === PendingValue) {
												return {
													environment: '',
													channelName: ''
												};
											}

											if (c.environment === channel.environment) {
												return {
													environment: c.environment,
													channelName: e.detail
												};
											}

											return {
												environment: c.environment,
												channelName: c.channelName
											};
										});

										const data = await updateTeam.mutate({
											slug: team,
											input: {
												slackAlertsChannels: updates
											}
										});

										if (data.errors) {
											slackChannelsError = true;
										}
									}}
								/>
							</div>
						{/if}
					{/each}
				</p>
				{#if slackChannelsError}
					<Alert variant="error" size="small">
						Error updating slack-channels. Please try again later.
					</Alert>
				{/if}
			{/if}
		</Card>
		<Card columns={6}>
			<h3>Managed resources</h3>
			{#if teamSettings.id === PendingValue}
				<Loader />
			{:else}
				{@const state = teamSettings.reconcilerState}
				{#each state.gcpProjects as project}
					{#if project.environment !== 'ci-gcp'}
						<dl>
							<dt>GCP project ID ({project.environment}):</dt>
							<dd>{project.projectId}</dd>
						</dl>
					{/if}
					{#if state.azureADGroupId}
						<dl>
							<dt>Azure AD group ID:</dt>
							<dd>{state.azureADGroupId}</dd>
						</dl>
					{/if}
					{#if state.garRepositoryName}
						<dl>
							<dt>Artifact Registry repository</dt>
							<dd>{formatGARRepo(state.garRepositoryName)}</dd>
						</dl>
					{/if}
					{#if state.gitHubTeamSlug}
						<dl>
							<dt>GitHub team:</dt>
							<dd>{state.gitHubTeamSlug}</dd>
						</dl>
					{/if}
					{#if state.googleWorkspaceGroupEmail}
						<dl>
							<dt>Google group email:</dt>
							<dd>{state.googleWorkspaceGroupEmail}</dd>
						</dl>
					{/if}
					{#each state.naisNamespaces as ns}
						{#if project.environment !== 'ci-gcp'}
							<dl>
								<dt>NAIS namespace ({ns.environment}):</dt>
								<dd>{ns.namespace}</dd>
							</dl>
						{/if}
					{/each}
				{:else}
					<p>No managed resources</p>
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

	.channel {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>
