<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import {
		PendingValue,
		graphql,
		type GetTeamDeleteKey$input,
		type GetTeamDeleteKey$result,
		type QueryResult, AuditEventResourceType
	} from '$houdini';
	import LogLine from '$lib/AuditLogLine.svelte';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import {
		Alert,
		BodyLong,
		Button,
		CopyButton,
		Loader,
		Modal,
		Skeleton,
		TextField
	} from '@nais/ds-svelte-community';
	import {
		ArrowsCirclepathIcon,
		ChatExclamationmarkIcon,
		EyeIcon,
		EyeSlashIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import { slide } from 'svelte/transition';
	import type { PageData } from './$houdini';
	import EditText from './EditText.svelte';
	import ActivityLog from '$lib/components/ActivityLog.svelte';

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

	const updateTeamSlackAlertsChannel = graphql(`
		mutation UpdateTeamSlackAlertsChannel($slug: Slug!, $input: UpdateTeamSlackAlertsChannelInput!) {
			updateTeamSlackAlertsChannel(slug: $slug, input: $input) {
				environments {
					slackAlertsChannel
				}
			}
		}
	`);

	const hookdResponse = graphql(`
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

	const getTeamDeleteKey = graphql(`
		mutation GetTeamDeleteKey($slug: Slug!) {
			requestTeamDeletion(slug: $slug) {
				key
			}
		}
	`);

	let deleteKeyLoading = false;
	let deleteKeyResp: QueryResult<GetTeamDeleteKey$result, GetTeamDeleteKey$input> | null = null;

	$: ({ TeamSettings, viewerIsOwner } = data);

	$: teamSettings = $TeamSettings.data?.team;

	$: team = $page.params.team;

	let showKey = false;
	let showRotateKey = false;
	let showDeleteTeam = false;

	let descriptionError = false;
	let defaultSlackChannelError = false;
	let slackChannelsError = false;

	const hasGlobalAttributes = (obj: {
		readonly azureGroupID: string | null;
		readonly gitHubTeamSlug: string | null;
		readonly googleGroupEmail: string | null;
		readonly googleArtifactRegistry: string | null;
	}) =>
		obj.azureGroupID !== null ||
		obj.gitHubTeamSlug !== null ||
		obj.googleGroupEmail !== null ||
		obj.googleArtifactRegistry !== null;

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

										const data = await updateTeamSlackAlertsChannel.mutate({
											slug: team,
											input: {
												environment: env.name,
												channelName: e.detail
											}
										});

										if (data.errors) {
											slackChannelsError = true;
										}
									}} />
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
					{#if hasGlobalAttributes(teamSettings)}
						{#if teamSettings.googleArtifactRegistry}
							<dt>Artifact Registry repository</dt>
							<dd>{formatGARRepo(teamSettings.googleArtifactRegistry)}</dd>
						{/if}
						{#if teamSettings.gitHubTeamSlug}
							<dt>GitHub team</dt>
							<dd>{teamSettings.gitHubTeamSlug}</dd>
						{/if}
						{#if teamSettings.googleGroupEmail}
							<dt>Google group email</dt>
							<dd>{teamSettings.googleGroupEmail}</dd>
						{/if}
						{#if teamSettings.azureGroupID}
							<dt>Azure AD group ID</dt>
							<dd>
								<a href="https://myaccount.microsoft.com/groups/{teamSettings.azureGroupID}"
									>{teamSettings.azureGroupID}</a
								>
							</dd>
						{/if}
					{:else}
						<Alert variant="info" size="small">No managed resources</Alert>
					{/if}
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

		{#key teamSettings || synchronizeClicked }
			<ActivityLog columns={12} teamName={team} resourceType={AuditEventResourceType.TEAM} />
		{/key}

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

		{#if viewerIsOwner}
			<Card style="border: 1px solid var(--a-border-danger);" columns={12}>
				<h3>Danger Zone</h3>
				<p>
					Deleting the team will permanently delete all managed resources and all resources within
					them. All applications, databases and jobs owned by the team will be irreversibly deleted.
				</p>
				<p>
					When you request deletion a delete key will be generated for this team. It is valid for 1
					hour. Another team-owner will have to confirm the deletion by using a generated link
					before the team is irreversibly deleted.
				</p>

				<Button
					variant="danger"
					on:click={() => {
						showDeleteTeam = !showDeleteTeam;
						deleteKeyResp = null;
					}}
				>
					<svelte:fragment slot="icon-left"><TrashIcon /></svelte:fragment>
					Request team deletion</Button
				>
			</Card>
			{#if browser}
				<Modal bind:open={showDeleteTeam}>
					<h3 slot="header">Request team deletion</h3>

					{#if !deleteKeyResp?.data}
						<BodyLong>
							Please confirm that you intend to delete <strong>{team}</strong> and all resources related
							to it.
						</BodyLong>
					{/if}

					{#if deleteKeyResp?.errors}
						<GraphErrors errors={deleteKeyResp.errors}></GraphErrors>
					{:else if deleteKeyResp?.data}
						{@const key =
							window.location + '/confirm_delete?key=' + deleteKeyResp.data.requestTeamDeletion.key}
						<Alert>
							Deletion of <strong>{team}</strong> has been requested. To finalize the deletion send
							this link to another team owner and let them confirm the deletion.

							<div class="deletewrapper">
								<div><TextField readonly={true} size="small" value={key}></TextField></div>
								<CopyButton
									text="Copy URL"
									activeText="URL copied"
									variant="action"
									copyText={key}
									size="small"
								/>
							</div>
						</Alert>
					{/if}

					<svelte:fragment slot="footer">
						{#if !deleteKeyResp?.data}
							<Button
								type="submit"
								loading={deleteKeyLoading}
								on:click={async () => {
									deleteKeyLoading = true;
									deleteKeyResp = await getTeamDeleteKey.mutate({ slug: team });
									deleteKeyLoading = false;
								}}>Confirm</Button
							>
							<Button
								variant="tertiary"
								disabled={deleteKeyLoading}
								type="reset"
								on:click={() => {
									showDeleteTeam = !showDeleteTeam;
								}}>Cancel</Button
							>
						{:else}
							<Button
								on:click={() => {
									showDeleteTeam = !showDeleteTeam;
								}}>Close</Button
							>
						{/if}
					</svelte:fragment>
				</Modal>
			{/if}
		{/if}
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

	.deletewrapper {
		display: flex;
		gap: 0.2rem;
	}

	.deletewrapper div {
		flex-grow: 1;
	}
</style>
