<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { PendingValue, graphql } from '$houdini';
	import LogLine from '$lib/AuditLogLine.svelte';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Button, CopyButton, Loader, Modal, Skeleton } from '@nais/ds-svelte-community';
	import {
		ArrowsCirclepathIcon,
		ChatExclamationmarkIcon,
		EyeIcon,
		EyeSlashIcon
	} from '@nais/ds-svelte-community/icons';
	import { slide } from 'svelte/transition';
	import type { PageData } from './$houdini';
	import EditText from './EditText.svelte';

	export let data: PageData;

	const rotateKey = graphql(`
		mutation RotateDeployKey($team: Slug!) {
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
				environments {
					slackAlertsChannel
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

	const globalAttributes = (obj: {
		readonly azureGroupID: string | null;
		readonly gitHubTeamSlug: string | null;
		readonly googleGroupEmail: string | null;
		readonly googleArtifactRegistry: string | null;
	}) => {
		const lines: { key: string; value: string }[] = [];

		if (obj.googleArtifactRegistry) {
			lines.push({
				key: 'Artifact Registry repository',
				value: formatGARRepo(obj.googleArtifactRegistry)
			});
		}
		if (obj.gitHubTeamSlug) {
			lines.push({ key: 'GitHub team', value: obj.gitHubTeamSlug });
		}
		if (obj.googleGroupEmail) {
			lines.push({ key: 'Google group email', value: obj.googleGroupEmail });
		}
		if (obj.azureGroupID) {
			lines.push({ key: 'Azure AD group ID', value: obj.azureGroupID });
		}
		return lines;
	};

	const envResources = (obj: { readonly gcpProjectID: string | null }) => {
		const lines: { key: string; value: string }[] = [];

		if (obj.gcpProjectID) {
			lines.push({ key: 'GCP project ID', value: obj.gcpProjectID });
		}
		return lines;
	};

	const formatGARRepo = (repo: string) => {
		const [, projectId, , location, , repository] = repo.split('/');
		return `${location}-docker.pkg.dev/${projectId}/${repository}`;
	};

	const synchronizeTeam = graphql(`
		mutation SynchronizeTeam($slug: Slug!) {
			synchronizeTeam(slug: $slug) {
				correlationID
			}
		}
	`);

	let synchronizeClicked = false;
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
			{#if teamSettings.environments && teamSettings.environments.length > 0}
				<p>
					Per-environment slack-channels to be used for alerts sent by the platform.
					{#each teamSettings.environments as env}
						{#if env !== PendingValue}
							<div class="channel">
								<b>{env.name}:</b>
								<EditText
									text={env.slackAlertsChannel}
									variant="textfield"
									on:save={async (e) => {
										slackChannelsError = false;
										if (!teamSettings) {
											return;
										}

										const updates = teamSettings.environments.map((c) => {
											if (c === PendingValue || env === PendingValue) {
												return {
													environment: '',
													channelName: ''
												};
											}

											if (c.name === env.name) {
												return {
													environment: c.name,
													channelName: e.detail
												};
											}

											return {
												environment: c.name,
												channelName: c.slackAlertsChannel
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
			<h3 class="with_button">
				Managed resources
				<Button
					size="xsmall"
					variant="secondary"
					loading={$synchronizeTeam.fetching}
					on:click={async () => {
						await synchronizeTeam.mutate({ slug: team });
						synchronizeClicked = true;
					}}
				>
					Synchronize team
				</Button>
			</h3>
			{#if $synchronizeTeam.errors}
				<GraphErrors errors={$synchronizeTeam.errors} dismissable={true} />
			{:else if synchronizeClicked}
				<div transition:slide={{ duration: 200 }}>
					<Alert variant="success" size="small">
						Synchronization started, team resources will soon be updated.
						<Button size="xsmall" variant="tertiary" on:click={() => (synchronizeClicked = false)}>
							Dismiss
						</Button>
					</Alert>
				</div>
			{/if}
			{#if teamSettings.id === PendingValue}
				<Loader />
			{:else}
				<h4>Global</h4>
				<dl>
					{#each globalAttributes(teamSettings) as { key, value }}
						<dt>{key}:</dt>
						<dd>{value}</dd>
					{:else}
						<Alert variant="info" size="small">No managed resources</Alert>
					{/each}
				</dl>

				{#each teamSettings.environments as env}
					<h4>{env.name}</h4>
					<dl>
						{#each envResources(env) as { key, value }}
							<dt>{key}:</dt>
							<dd>{value}</dd>
						{:else}
							<Alert variant="info" size="small">No managed resources</Alert>
						{/each}
					</dl>
				{/each}
			{/if}
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

		<Card columns={12}>
			<h3>Logs</h3>

			{#each teamSettings.auditLogs.nodes as log}
				{#if log !== PendingValue}
					<LogLine {log} />
				{:else}
					<Skeleton variant="text" />
				{/if}
			{:else}
				<p>No audit logs</p>
			{/each}

			{#if teamSettings.auditLogs.pageInfo.hasNextPage !== PendingValue && teamSettings.auditLogs.pageInfo.hasNextPage}
				<div class="center">
					<Button variant="secondary" size="medium" as="a" href="/team/{team}/settings/audit_logs">
						Show more logs
					</Button>
				</div>
			{/if}
		</Card>
	</div>
{/if}

<style>
	dl {
		display: block;
		margin-block-start: 0.2em;
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
		margin: 0.8rem 0rem 0.2rem 0;
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

	h3.with_button {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.center {
		text-align: center;
	}
</style>
