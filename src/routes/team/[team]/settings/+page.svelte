<script lang="ts">
	import { browser } from '$app/environment';
	import {
		type GetTeamDeleteKey$input,
		type GetTeamDeleteKey$result,
		graphql,
		type QueryResult
	} from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import SlackIcon from '$lib/icons/SlackIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Time from '$lib/Time.svelte';
	import {
		Alert,
		BodyLong,
		BodyShort,
		Button,
		CopyButton,
		Heading,
		Modal,
		TextField
	} from '@nais/ds-svelte-community';
	import {
		ArrowsCirclepathIcon,
		EyeIcon,
		EyeSlashIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$houdini';
	import EditText from './EditText.svelte';

	let { data }: PageProps = $props();
	let { TeamSettings, viewerIsOwner, teamSlug, viewerIsMember } = $derived(data);

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

	let teamSettings = $derived($TeamSettings.data?.team);

	let showKey = $state(false);
	let showRotateKey = $state(false);
	let showDeleteTeam = $state(false);

	let descriptionErrors: { message: string }[] | undefined = $state();
	let defaultSlackChannelErrors: { message: string }[] | undefined = $state();
	let slackChannelsErrors: { message: string }[] | undefined = $state();

	const formatGARRepo = (repo: string) => {
		const [, projectId, , location, , repository] = repo.split('/');
		return `${location}-docker.pkg.dev/${projectId}/${repository}`;
	};
</script>

<GraphErrors errors={$TeamSettings.errors} />

{#if teamSettings}
	<div class="wrapper">
		<div style="display: flex; flex-direction: column; gap: var(--spacing-layout)">
			<div>
				<Heading level="2">Description</Heading>
				<EditText
					text={teamSettings.purpose}
					on:save={async (e) => {
						descriptionErrors = undefined;
						const data = await updateTeam.mutate({
							input: {
								slug: teamSlug,
								purpose: e.detail
							}
						});

						if (data.errors) {
							descriptionErrors = data.errors;
						}
					}}
					isMember={viewerIsMember}
				/>

				<GraphErrors errors={descriptionErrors} size="small" />
			</div>

			<div>
				<Heading level="2"><SlackIcon class="heading-aligned-icon" /> Slack Alert Channels</Heading>
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
										slug: teamSlug,
										slackChannel: e.detail
									}
								});

								if (data.errors) {
									defaultSlackChannelErrors = data.errors;
								}
							}}
							isMember={viewerIsMember}
						/>
					</p>
					<GraphErrors errors={defaultSlackChannelErrors} size="small" />
				{/if}
				{#if teamSettings.environments && teamSettings.environments.length > 0}
					<div>
						Per-environment slack-channels to be used for alerts sent by the platform.
						{#each teamSettings.environments as env (env.id)}
							<div class="channel">
								<b>{env.environment.name}:</b>
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
												slug: teamSlug,
												environmentName: env.environment.name,
												slackAlertsChannel: e.detail
											}
										});

										if (data.errors) {
											slackChannelsErrors = data.errors;
										}
									}}
									isMember={viewerIsMember}
								/>
							</div>
						{/each}
					</div>

					<GraphErrors errors={slackChannelsErrors} size="small" />
				{/if}
			</div>

			<div>
				<Heading level="2">Deploy Key</Heading>
				<BodyShort>
					Deploy keys can be used to authenticate for deployments instead of using
					<a
						href={docURL(
							'/build/how-to/build-and-deploy/#authorize-your-github-repository-for-deployment'
						)}
					>
						repository authorization
					</a>. This allows for deploying from other CI systems than GitHub Actions, as well as from
					local machines.
				</BodyShort>

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
										onclick={() => {
											showKey = !showKey;
										}}
										icon={EyeSlashIcon}
									/>
								{:else}
									{deployKey.key.replaceAll(/./g, '*')}
									<Button
										size="xsmall"
										variant="tertiary"
										onclick={() => {
											showKey = !showKey;
										}}
										icon={EyeIcon}
										disabled={!viewerIsMember}
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
								disabled={!viewerIsMember}
							/>
						</div>
						<div class="button">
							<Button
								size="small"
								variant="danger"
								onclick={() => {
									showRotateKey = !showRotateKey;
								}}
								icon={ArrowsCirclepathIcon}
								disabled={!viewerIsMember}
							>
								Rotate key
							</Button>
						</div>
					</div>
				{:else}
					<Alert variant="error">Error getting deploy key. Try again later.</Alert>
				{/if}
			</div>

			{#if viewerIsOwner}
				<div>
					<Heading level="2"><WarningIcon class="heading-aligned-icon" /> Danger Zone</Heading>
					<div class="danger-zone">
						<BodyLong spacing>
							Deleting the team will permanently delete all managed resources and all resources
							within them. All applications, databases and jobs owned by the team will be
							irreversibly deleted.
						</BodyLong>
						<BodyLong spacing>
							When you request deletion a delete key will be generated for this team. It is valid
							for 1 hour. Another team-owner will have to confirm the deletion by using a generated
							link before the team is irreversibly deleted.
						</BodyLong>

						<Button
							variant="danger"
							onclick={() => {
								showDeleteTeam = !showDeleteTeam;
								//deleteKeyResp = null;
							}}
							icon={TrashIcon}
						>
							Request team deletion</Button
						>
					</div>
				</div>
			{/if}
		</div>
		<div>
			<div class="card">
				<Heading level="2" size="small">Managed Resources</Heading>
				<dl>
					{#if $TeamSettings.data?.team.externalResources}
						{@const external = $TeamSettings.data.team.externalResources}
						{#if external.googleArtifactRegistry}
							<Heading level="3" size="xsmall">Google Artifact Registry</Heading>
							<BodyShort style="font-size: 0.9rem">
								<ExternalLink
									href="https://console.cloud.google.com/gcr/images/{formatGARRepo(
										external.googleArtifactRegistry.repository
									)}"
								>
									{formatGARRepo(external.googleArtifactRegistry.repository)}
								</ExternalLink>
							</BodyShort>
						{/if}
						{#if external.entraIDGroup}
							<Heading level="3" size="xsmall">Entra ID Group</Heading>
							<BodyShort style="font-size: 0.9rem">
								<ExternalLink
									href="https://myaccount.microsoft.com/groups/{external.entraIDGroup.groupID}"
								>
									{external.entraIDGroup.groupID}
								</ExternalLink>
							</BodyShort>
						{/if}
						{#if external.cdn}
							<Heading level="3" size="xsmall">Team CDN bucket</Heading>
							<BodyShort style="font-size: 0.9rem">
								<ExternalLink
									href="https://console.cloud.google.com/storage/browser/{external.cdn.bucket}"
								>
									{external.cdn.bucket}
								</ExternalLink>
							</BodyShort>
						{/if}
					{/if}
					{#each $TeamSettings.data?.team.environments.filter((e) => e.gcpProjectID) ?? [] as teamEnvironment (teamEnvironment.id)}
						<Heading level="3" size="xsmall"
							>Team project in {teamEnvironment.environment.name}</Heading
						>
						<BodyShort style="font-size: 0.9rem">
							<ExternalLink
								href="https://console.cloud.google.com/home/dashboard?project={teamEnvironment.gcpProjectID}"
							>
								{teamEnvironment.gcpProjectID}
							</ExternalLink>
						</BodyShort>
					{/each}
				</dl>
			</div>
		</div>
		<p class="last-sync">
			{#if teamSettings.lastSuccessfulSync}
				Last successful sync: <Time time={teamSettings.lastSuccessfulSync} distance={true} />
			{:else}
				No successful syncs
			{/if}
		</p>
	</div>
{/if}
{#if browser}
	<Modal bind:open={showRotateKey} closeButton={false}>
		{#snippet header()}
			<Heading level="1" size="medium">Rotate deploy key</Heading>
		{/snippet}
		<BodyShort spacing>Are you sure you want to rotate the deploy key?</BodyShort>

		{#snippet footer()}
			<Button
				variant="danger"
				onclick={async () => {
					//rotateClicked = false;
					showRotateKey = !showRotateKey;
					await rotateKey.mutate({ team: teamSlug });
					//rotateClicked = true;
				}}>Rotate key</Button
			>
			<Button
				onclick={() => {
					showRotateKey = !showRotateKey;
				}}>Cancel</Button
			>
		{/snippet}
	</Modal>

	<Modal bind:open={showDeleteTeam}>
		{#snippet header()}
			<Heading level="1" size="medium">Request Team Deletion</Heading>
		{/snippet}

		{#if !deleteKeyResp?.data}
			<BodyLong>
				Confirm that you intend to delete <strong>{teamSlug}</strong> and all resources related to it.
			</BodyLong>
		{/if}

		{#if deleteKeyResp?.errors}
			<GraphErrors errors={deleteKeyResp.errors}></GraphErrors>
		{:else if deleteKeyResp?.data}
			{@const key =
				window.location + '/confirm_delete?key=' + deleteKeyResp.data.requestTeamDeletion.key?.key}
			<Alert>
				Deletion of <strong>{teamSlug}</strong> has been requested. To finalize the deletion send
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
					onclick={async () => {
						deleteKeyLoading = true;
						deleteKeyResp = await getTeamDeleteKey.mutate({
							input: { slug: teamSlug }
						});
						deleteKeyLoading = false;
					}}>Confirm</Button
				>
				<Button
					variant="tertiary"
					disabled={deleteKeyLoading}
					type="reset"
					onclick={() => {
						showDeleteTeam = !showDeleteTeam;
					}}>Cancel</Button
				>
			{:else}
				<Button
					onclick={() => {
						showDeleteTeam = !showDeleteTeam;
					}}>Close</Button
				>
			{/if}
		{/snippet}
	</Modal>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: var(--spacing-layout);
	}
	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-16) var(--ax-space-20);
		border-radius: 12px;
		align-self: start;
	}
	.danger-zone {
		padding: var(--ax-space-16);
		border-radius: 8px;
		border: 1px solid var(--ax-border-danger);
	}

	.deployKey {
		font-family: monospace;
		padding-bottom: 1rem;
	}

	.buttons {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}
	.button {
		width: 130px;
	}

	.channel {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
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
		color: var(--ax-text-info-subtle);
		font-size: 0.9rem;
		text-align: right;
	}
</style>
