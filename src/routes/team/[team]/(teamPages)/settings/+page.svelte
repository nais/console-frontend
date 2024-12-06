<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import {
		type GetTeamDeleteKey$input,
		type GetTeamDeleteKey$result,
		graphql,
		type QueryResult
	} from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, BodyLong, Button, CopyButton, Modal, TextField } from '@nais/ds-svelte-community';
	import {
		ArrowsCirclepathIcon,
		ChatExclamationmarkIcon,
		EyeIcon,
		EyeSlashIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import EditText from './EditText.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const rotateKey = graphql(`
		mutation RotateDeployKey($team: Slug!) {
			changeDeploymentKey(input: { teamSlug: $team }) {
				deploymentKey {
					created
					expires
					key
				}
			}
		}
	`);

	const updateTeam = graphql(`
		mutation UpdateTeam($input: UpdateTeamInput!) {
			updateTeam(input: $input) {
				team {
					purpose
					slackChannel
				}
			}
		}
	`);

	const updateTeamSlackAlertsChannel = graphql(`
		mutation UpdateTeamSlackAlertsChannel($input: UpdateTeamEnvironmentInput!) {
			updateTeamEnvironment(input: $input) {
				environment {
					slackAlertsChannel
				}
			}
		}
	`);

	const getTeamDeleteKey = graphql(`
		mutation GetTeamDeleteKey($input: RequestTeamDeletionInput!) {
			requestTeamDeletion(input: $input) {
				key {
					createdAt
					createdBy {
						email
					}
					expires
					key
					team {
						slug
					}
				}
			}
		}
	`);

	let deleteKeyLoading = $state(false);
	let deleteKeyResp: QueryResult<GetTeamDeleteKey$result, GetTeamDeleteKey$input> | null =
		$state(null);

	let { TeamSettings, viewerIsOwner } = $derived(data);

	let teamSettings = $derived($TeamSettings.data?.team);

	let team = $derived($page.params.team);

	let showKey = $state(false);
	let showRotateKey = $state(false);
	let showDeleteTeam = $state(false);

	let descriptionErrors: { message: string }[] | undefined = $state();
	let defaultSlackChannelErrors: { message: string }[] | undefined = $state();
	let slackChannelsErrors: { message: string }[] | undefined = $state();

	const hasGlobalAttributes = (obj: {
		readonly entraIDGroup: unknown | null;
		readonly gitHubTeam: unknown | null;
		readonly googleGroup: unknown | null;
		readonly googleArtifactRegistry: unknown | null;
		readonly cdn: unknown | null;
	}) =>
		obj.entraIDGroup !== null ||
		obj.gitHubTeam !== null ||
		obj.googleGroup !== null ||
		obj.googleArtifactRegistry !== null ||
		obj.cdn !== null;

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

	//let rotateClicked = false;
</script>

<GraphErrors errors={$TeamSettings.errors} />

{#if teamSettings}
	<div class="grid">
		<Card columns={6}>
			<h3>{team}</h3>

			<i>
				<EditText
					text={teamSettings.purpose}
					on:save={async (e) => {
						descriptionErrors = undefined;
						const data = await updateTeam.mutate({
							input: {
								slug: team,
								purpose: e.detail
							}
						});

						if (data.errors) {
							descriptionErrors = data.errors;
						}
					}}
				/>
			</i>

			<GraphErrors errors={descriptionErrors} size="small" />

			<h4><ChatExclamationmarkIcon /> Slack channels</h4>
			{#if teamSettings.slackChannel !== ''}
				<p>
					<b>Default slack-channel:</b>
					<EditText
						text={teamSettings.slackChannel}
						variant="textfield"
						on:save={async (e) => {
							defaultSlackChannelErrors = undefined;
							const data = await updateTeam.mutate({
								input: {
									slug: team,
									slackChannel: e.detail
								}
							});

							if (data.errors) {
								defaultSlackChannelErrors = data.errors;
							}
						}}
					/>
				</p>
				<GraphErrors errors={defaultSlackChannelErrors} size="small" />
			{/if}
			{#if teamSettings.environments && teamSettings.environments.length > 0}
				<div>
					Per-environment slack-channels to be used for alerts sent by the platform.
					{#each teamSettings.environments as env}
						<div class="channel">
							<b>{env.name}:</b>
							<EditText
								text={env.slackAlertsChannel}
								variant="textfield"
								on:save={async (e) => {
									slackChannelsErrors = undefined;
									if (!teamSettings) {
										return;
									}

									const data = await updateTeamSlackAlertsChannel.mutate({
										input: {
											slug: team,
											environmentName: env.name,
											slackAlertsChannel: e.detail
										}
									});

									if (data.errors) {
										slackChannelsErrors = data.errors;
									}
								}}
							/>
						</div>
					{/each}
				</div>

				<GraphErrors errors={slackChannelsErrors} size="small" />
			{/if}
		</Card>
		<Card columns={6}>
			<h3 class="with_button">Managed resources</h3>

			<h4>Global</h4>
			<dl>
				{#if hasGlobalAttributes(teamSettings.externalResources)}
					{@const external = teamSettings.externalResources}
					{#if external.googleArtifactRegistry}
						<dt>Artifact Registry repository</dt>
						<dd>{formatGARRepo(external.googleArtifactRegistry.repository)}</dd>
					{/if}
					{#if external.gitHubTeam}
						<dt>GitHub team</dt>
						<dd>{external.gitHubTeam.slug}</dd>
					{/if}
					{#if external.googleGroup}
						<dt>Google group email</dt>
						<dd>{external.googleGroup.email}</dd>
					{/if}
					{#if external.cdn}
						<dt>Team CDN bucket</dt>
						<dd>
							<a href="https://console.cloud.google.com/storage/browser/{external.cdn.bucket}">
								{external.cdn.bucket}
							</a>
						</dd>
					{/if}
					{#if external.entraIDGroup}
						<dt>Azure AD group ID</dt>
						<dd>
							<a href="https://myaccount.microsoft.com/groups/{external.entraIDGroup.groupID}">
								{external.entraIDGroup.groupID}
							</a>
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
		</Card>

		<Card columns={12}>
			<h3>Deploy key</h3>
			<p>
				Deploy keys can be used to authenticate for deployments instead of using
				<a
					href="https://docs.nais.io/build/how-to/build-and-deploy/#authorize-your-github-repository-for-deployment"
				>
					repository authorization
				</a>. This allows for deploying from other CI systems than GitHub Actions, as well as from
				local machines.
			</p>

			{#if teamSettings.deploymentKey}
				{@const deployKey = teamSettings.deploymentKey}
				<dl>
					<dt>Created:</dt>
					<dd><Time time={deployKey.created} distance={true} /></dd>
					<dt>Expires:</dt>
					<dd><Time time={deployKey.expires} distance={true} /></dd>
					<dt>Key:</dt>
					<dd>
						<div class="deployKey">
							{#if showKey}
								{deployKey.key}
								<Button
									size="xsmall"
									variant="tertiary"
									onClick={() => {
										showKey = !showKey;
									}}
									iconLeft={EyeSlashIcon}
								/>
							{:else}
								{deployKey.key.replaceAll(/./g, '*')}
								<Button
									size="xsmall"
									variant="tertiary"
									onClick={() => {
										showKey = !showKey;
									}}
									iconLeft={EyeIcon}
								/>
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
							copyText={deployKey.key}
							size="small"
						/>
					</div>
					<div class="button">
						<Button
							size="small"
							variant="danger"
							onClick={() => {
								showRotateKey = !showRotateKey;
							}}
							iconLeft={ArrowsCirclepathIcon}
						>
							Rotate key
						</Button>
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
					onClick={() => {
						showRotateKey = !showRotateKey;
					}}
				>
					Cancel</Button
				>
				<Button
					variant="danger"
					onClick={async () => {
						//rotateClicked = false;
						showRotateKey = !showRotateKey;
						await rotateKey.mutate({ team });
						//rotateClicked = true;
					}}
				>
					Rotate key</Button
				>
			</Modal>
		{/if}

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
					onClick={() => {
						showDeleteTeam = !showDeleteTeam;
						//deleteKeyResp = null;
					}}
					iconLeft={TrashIcon}
				>
					Request team deletion</Button
				>
			</Card>
			<p class="last-sync">
				{#if teamSettings.lastSuccessfulSync}
					Last successful sync: <Time time={teamSettings.lastSuccessfulSync} distance={true} />
				{:else}
					No successful syncs
				{/if}
			</p>
			{#if browser}
				<Modal bind:open={showDeleteTeam}>
					{#snippet header()}
						<h3>Request team deletion</h3>
					{/snippet}

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
							window.location +
							'/confirm_delete?key=' +
							deleteKeyResp.data.requestTeamDeletion.key?.key}
						<Alert>
							Deletion of <strong>{team}</strong> has been requested. To finalize the deletion send
							this link to another team owner and let them confirm the deletion.

							<div class="deletewrapper">
								<div>
									<TextField
										label="Sharable url"
										hideLabel={true}
										readonly={true}
										size="small"
										value={key}
									></TextField>
								</div>
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

					{#snippet footer()}
						{#if !deleteKeyResp?.data}
							<Button
								type="submit"
								loading={deleteKeyLoading}
								onClick={async () => {
									deleteKeyLoading = true;
									deleteKeyResp = await getTeamDeleteKey.mutate({ input: { slug: team } });
									deleteKeyLoading = false;
								}}>Confirm</Button
							>
							<Button
								variant="tertiary"
								disabled={deleteKeyLoading}
								type="reset"
								onClick={() => {
									showDeleteTeam = !showDeleteTeam;
								}}>Cancel</Button
							>
						{:else}
							<Button
								onClick={() => {
									showDeleteTeam = !showDeleteTeam;
								}}>Close</Button
							>
						{/if}
					{/snippet}
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

	.deletewrapper {
		display: flex;
		gap: 0.2rem;
	}

	.deletewrapper div {
		flex-grow: 1;
	}
	.last-sync {
		width: 100%;
		grid-column: span 12;
		color: var(--a-text-subtle);
		font-size: 0.8rem;
		text-align: right;
	}
</style>
