<script lang="ts">
	import { browser } from '$app/environment';
	import {
		type GetTeamDeleteKey$input,
		type GetTeamDeleteKey$result,
		graphql,
		type QueryResult
	} from '$houdini';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import SlackIcon from '$lib/icons/SlackIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Time from '$lib/Time.svelte';
	import {
		Alert,
		BodyLong,
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
	let { teamSlug, viewerIsMember } = $derived(data);

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

	let showKey = $state(false);
	let showRotateKey = $state(false);
	let showDeleteTeam = $state(false);

	let descriptionErrors: { message: string }[] | undefined = $state();
	let defaultSlackChannelErrors: { message: string }[] | undefined = $state();
	let slackChannelsErrors: { message: string }[] | undefined = $state();
</script>

<GraphErrors errors={$TeamSettings.errors} />

{#if teamSettings}
	<div class="wrapper">
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
			<Heading level="2"><SlackIcon /> Slack Channels</Heading>
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
											slug: teamSlug,
											environmentName: env.name,
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
			<p>
				Deploy keys can be used to authenticate for deployments instead of using
				<a
					href={docURL(
						'/build/how-to/build-and-deploy/#authorize-your-github-repository-for-deployment'
					)}
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
			{#if browser}
				<Modal bind:open={showRotateKey} closeButton={false}>
					<h3>Rotate deploy key</h3>
					<p>Are you sure you want to rotate the deploy key?</p>
					<Button
						onclick={() => {
							showRotateKey = !showRotateKey;
						}}
					>
						Cancel</Button
					>
					<Button
						variant="danger"
						onclick={async () => {
							//rotateClicked = false;
							showRotateKey = !showRotateKey;
							await rotateKey.mutate({ team: teamSlug });
							//rotateClicked = true;
						}}
					>
						Rotate key</Button
					>
				</Modal>
			{/if}
		</div>

		{#if viewerIsOwner}
			<div>
				<Heading level="2"><WarningIcon /> Danger Zone</Heading>
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
					onclick={() => {
						showDeleteTeam = !showDeleteTeam;
						//deleteKeyResp = null;
					}}
					icon={TrashIcon}
				>
					Request team deletion</Button
				>
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
								Confirm that you intend to delete <strong>{teamSlug}</strong> and all resources related
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
								Deletion of <strong>{teamSlug}</strong> has been requested. To finalize the deletion
								send this link to another team owner and let them confirm the deletion.

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
										deleteKeyResp = await getTeamDeleteKey.mutate({ input: { slug: teamSlug } });
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
			</div>
		{/if}
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
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
		grid-column: span 12;
		color: var(--a-text-subtle);
		font-size: 0.8rem;
		text-align: right;
	}
</style>
