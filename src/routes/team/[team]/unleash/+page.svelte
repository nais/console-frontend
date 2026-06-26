<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import { docURL } from '$lib/doc';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import Time from '$lib/ui/Time.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import {
		Alert,
		BodyLong,
		BodyShort,
		Button,
		CopyButton,
		Heading,
		Loader,
		Select,
		Table,
		Tbody,
		Td,
		TextField,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		PencilIcon,
		PlusCircleFillIcon,
		PlusIcon,
		TrashIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import type { GraphQLError } from 'houdini/runtime';
	import prettyBytes from 'pretty-bytes';
	import { onDestroy } from 'svelte';
	import type { PageProps } from './$types';
	import TeamSearchModal from './TeamSearchModal.svelte';

	function extractErrorMessages(errors: GraphQLError[] | null | undefined): string[] {
		if (!errors || errors.length === 0) {
			return [];
		}
		return errors.map((error) => {
			if (error.extensions?.code) {
				return `${error.message} (${error.extensions.code})`;
			}
			return error.message;
		});
	}

	let { data }: PageProps = $props();
	let { Unleash, UnleashReleaseChannels, teamSlug, viewerIsMember } = $derived(data);

	// Derived state
	const unleash = $derived($Unleash.data?.team?.unleash);
	const releaseChannels = $derived($UnleashReleaseChannels.data?.unleashReleaseChannels ?? []);
	const metrics = $derived(
		unleash?.metrics ?? {
			apiTokens: 0,
			cpuUtilization: 0,
			cpuRequests: 0,
			memoryUtilization: 0,
			memoryRequests: 0,
			toggles: 0
		}
	);
	const enabled = $derived(true);

	// GraphQL mutations
	const createUnleashForTeam = graphql(`
		mutation createUnleashForTeam($team: Slug!) {
			createUnleashForTeam(input: { teamSlug: $team }) {
				unleash {
					name
					version
					releaseChannelName
					allowedTeams {
						nodes {
							slug
						}
					}
					webIngress
					apiIngress
					metrics {
						apiTokens
						cpuUtilization
						cpuRequests
						memoryUtilization
						memoryRequests
						toggles
					}
					ready
				}
			}
		}
	`);

	const updateUnleashInstance = graphql(`
		mutation UpdateUnleashInstance($team: Slug!, $releaseChannel: String!) {
			updateUnleashInstance(input: { teamSlug: $team, releaseChannel: $releaseChannel }) {
				unleash {
					name
					releaseChannelName
					releaseChannel {
						name
						currentVersion
						type
						lastUpdated
					}
				}
			}
		}
	`);

	// Component state
	let releaseChannelLoading = $state(false);
	let editingReleaseChannel = $state(false);
	let creatingUnleash = $state(false);
	let pollingInterval: number | undefined = $state(undefined);

	// Helper functions
	/**
	 * Extract version from docker image path
	 * @example "nais-unleash:v5-5.12.8-1ea28db" -> "5.12.8"
	 */
	const extractVersion = (imageOrVersion: string): string => {
		const tagMatch = imageOrVersion.match(/:v\d+-(\d+\.\d+\.\d+)/);
		return tagMatch?.[1] ?? imageOrVersion;
	};

	// Event handlers
	const updateReleaseChannel = async (e: Event) => {
		if (!e.target || !(e.target instanceof HTMLSelectElement)) return;
		const newChannel = e.target.value;
		if (!newChannel || newChannel === unleash?.releaseChannelName) return;

		releaseChannelLoading = true;
		try {
			const result = await updateUnleashInstance.mutate({
				team: teamSlug,
				releaseChannel: newChannel
			});

			if (!result.errors) {
				await Unleash.fetch({ policy: 'CacheAndNetwork' });
			}
		} catch (error) {
			console.error('Network error updating release channel:', error);
		} finally {
			releaseChannelLoading = false;
		}
	};

	const createNewUnleash = async () => {
		creatingUnleash = true;
		await createUnleashForTeam.mutate({
			team: teamSlug
		});

		if ($createUnleashForTeam.errors) {
			creatingUnleash = false;
			return;
		}

		Unleash.fetch({ policy: 'CacheAndNetwork' });
		// Start polling until Unleash is ready
		startPolling();
	};

	const startPolling = () => {
		if (pollingInterval) return; // Already polling
		pollingInterval = window.setInterval(() => {
			Unleash.fetch({ policy: 'NetworkOnly' });
		}, 3000); // Poll every 3 seconds
	};

	const stopPolling = () => {
		if (pollingInterval) {
			window.clearInterval(pollingInterval);
			pollingInterval = undefined;
		}
		creatingUnleash = false;
	};

	// Watch for when unleash becomes ready
	$effect(() => {
		if (unleash?.ready && (creatingUnleash || pollingInterval)) {
			stopPolling();
		}
	});

	onDestroy(() => {
		stopPolling();
	});

	const allowTeamAccess = graphql(`
		mutation AllowTeamAccess($team: Slug!, $allowedTeamSlug: Slug!) {
			allowTeamAccessToUnleash(input: { teamSlug: $team, allowedTeamSlug: $allowedTeamSlug }) {
				unleash {
					name
				}
			}
		}
	`);
	const revokeTeamAccess = graphql(`
		mutation RevokeTeamAccess($team: Slug!, $revokedTeamSlug: Slug!) {
			revokeTeamAccessToUnleash(input: { teamSlug: $team, revokedTeamSlug: $revokedTeamSlug }) {
				unleash {
					name
				}
			}
		}
	`);

	let removeTeamName = $state('');
	let removeTeamConfirmOpen = $state(false);

	const removeTeam = (removeTeamName: string) =>
		revokeTeamAccess
			.mutate({
				team: teamSlug,
				revokedTeamSlug: removeTeamName
			})
			.then(() => Unleash.fetch({ policy: 'CacheAndNetwork' }));

	const handleRemoveTeamClick = (teamName: string) => {
		removeTeamName = teamName;
		removeTeamConfirmOpen = true;
	};

	let addTeamModalOpen = $state(false);

	const addTeam = (teamName: string) =>
		allowTeamAccess
			.mutate({
				team: teamSlug,
				allowedTeamSlug: teamName
			})
			.then(() => Unleash.fetch({ policy: 'CacheAndNetwork' }));

	// Delete Unleash instance
	const deleteUnleashInstance = graphql(`
		mutation DeleteUnleashInstance($team: Slug!) {
			deleteUnleashInstance(input: { teamSlug: $team }) {
				unleashDeleted
			}
		}
	`);

	let deleteConfirmOpen = $state(false);
	let deleteConfirmation = $state('');
	let deleting = $state(false);
	let deleteError = $state('');
	const allowedTeamsCount = $derived(unleash?.allowedTeams.edges.length ?? 0);
	const canDelete = $derived(allowedTeamsCount === 1 && unleash?.ready);
	const deleteConfirmed = $derived(deleteConfirmation === unleash?.name);

	const deleteUnleash = async () => {
		deleting = true;
		deleteError = '';
		try {
			const result = await deleteUnleashInstance.mutate({ team: teamSlug });
			if (result.errors && result.errors.length > 0) {
				deleteError = extractErrorMessages(result.errors).join(', ');
			} else if (result.data?.deleteUnleashInstance.unleashDeleted) {
				goto(`/team/${page.params.team}?deleted=unleash`);
			} else {
				deleteError = 'Failed to delete the Unleash instance. Please try again.';
			}
		} catch (e) {
			deleteError = e instanceof Error ? e.message : 'An unexpected error occurred.';
		} finally {
			deleting = false;
		}
	};
</script>

{#if $Unleash.errors}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages($Unleash.errors)) as error (error)}
			{error}<br />
		{/each}
	</Alert>
{/if}

{#if $UnleashReleaseChannels.errors}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages($UnleashReleaseChannels.errors)) as error (error)}
			{error}<br />
		{/each}
	</Alert>
{/if}

{#if $createUnleashForTeam.errors}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages($createUnleashForTeam.errors)) as error (error)}
			{error}<br />
		{/each}
		<Button variant="tertiary" size="small" onclick={() => ($createUnleashForTeam.errors = [])}>
			Dismiss
		</Button>
	</Alert>
{/if}

{#if $updateUnleashInstance.errors}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages($updateUnleashInstance.errors)) as error (error)}
			{error}<br />
		{/each}
		<Button variant="tertiary" size="small" onclick={() => ($updateUnleashInstance.errors = [])}>
			Dismiss
		</Button>
	</Alert>
{/if}

{#if $allowTeamAccess.errors}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages($allowTeamAccess.errors)) as error (error)}
			{error}<br />
		{/each}
		<Button variant="tertiary" size="small" onclick={() => ($allowTeamAccess.errors = [])}>
			Dismiss
		</Button>
	</Alert>
{/if}

{#if $revokeTeamAccess.errors}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages($revokeTeamAccess.errors)) as error (error)}
			{error}<br />
		{/each}
		<Button variant="tertiary" size="small" onclick={() => ($revokeTeamAccess.errors = [])}>
			Dismiss
		</Button>
	</Alert>
{/if}

{#if $deleteUnleashInstance.errors}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages($deleteUnleashInstance.errors)) as error (error)}
			{error}<br />
		{/each}
		<Button variant="tertiary" size="small" onclick={() => ($deleteUnleashInstance.errors = [])}>
			Dismiss
		</Button>
	</Alert>
{/if}

{#if deleteError}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{deleteError}
		<Button variant="tertiary" size="small" onclick={() => (deleteError = '')}>Dismiss</Button>
	</Alert>
{/if}

{#if !enabled}
	<Alert style="margin-bottom: 1rem;" variant="info">
		Unleash is not enabled for this tenant. Contact your administrator.
	</Alert>
{:else if unleash}
	{#if !unleash.ready}
		<Alert variant="info" size="small">
			<Loader size="small" /> Your Unleash instance is being created. This usually takes about a minute...
		</Alert>
	{/if}
	{#if !unleash.releaseChannelName}
		<Alert variant="warning" size="small">
			No release channel configured. All Unleash instances are being transitioned to release
			channels for automatic version management. Please select a release channel to ensure your
			instance receives updates.
		</Alert>
	{/if}
	<Confirm
		confirmText="Delete"
		variant="danger"
		bind:open={removeTeamConfirmOpen}
		onconfirm={() => removeTeam(removeTeamName)}
	>
		{#snippet header()}
			<Heading>Remove Team Access</Heading>
		{/snippet}
		<BodyShort>
			This will permanently remove the team named <b>{removeTeamName}</b> from
			<b>{unleash.name}</b>.
		</BodyShort>

		<BodyShort>Are you sure you want to remove this team?</BodyShort>
	</Confirm>

	{#if viewerIsMember}
		<Confirm
			confirmText="Delete"
			variant="danger"
			bind:open={deleteConfirmOpen}
			onconfirm={deleteUnleash}
			disabled={!canDelete || !deleteConfirmed}
		>
			{#snippet header()}
				<Heading>Delete Unleash Instance</Heading>
			{/snippet}
			{#if !canDelete}
				<Alert variant="warning" size="small" style="margin-bottom: var(--ax-space-8);">
					{#if !unleash.ready}
						The Unleash instance must be ready before it can be deleted.
					{:else if allowedTeamsCount > 1}
						Revoke access for all other teams before deleting. Currently {allowedTeamsCount - 1} other
						team{allowedTeamsCount > 2 ? 's have' : ' has'} access.
					{/if}
				</Alert>
			{:else}
				<BodyShort spacing>
					This will permanently delete the Unleash instance <b>{unleash.name}</b> and all its data.
				</BodyShort>
				<BodyShort spacing>
					This action cannot be undone. To confirm, type <b>{unleash.name}</b> below:
				</BodyShort>
				<TextField
					label="Confirm instance name"
					hideLabel
					bind:value={deleteConfirmation}
					placeholder={unleash.name}
				/>
				{#if !deleteConfirmed && deleteConfirmation.length > 0}
					<Alert variant="error" size="small" style="margin-top: var(--ax-space-4);">
						The instance name does not match.
					</Alert>
				{/if}
			{/if}
		</Confirm>
	{/if}

	{#if addTeamModalOpen}
		<TeamSearchModal
			bind:open={addTeamModalOpen}
			{addTeam}
			{removeTeam}
			currentTeam={teamSlug}
			teamsWithAccess={unleash.allowedTeams.edges.map(({ node: t }) => t.slug)}
		/>
	{/if}

	<div class="layout-two-column">
		<div class="content">
			{#if viewerIsMember}
				<div class="detail-actions">
					<Button
						variant="danger"
						size="small"
						loading={deleting}
						onclick={() => {
							deleteConfirmation = '';
							deleteError = '';
							deleteConfirmOpen = true;
						}}
						icon={TrashIcon}
					>
						Delete
					</Button>
				</div>
			{/if}

			<section aria-labelledby="info-heading">
				<Heading as="h2" id="info-heading" size="medium" spacing>Instance details</Heading>
				<dl class="settings-list">
					<dt>Name</dt>
					<dd>{unleash.name}</dd>
					<dt>Status</dt>
					<dd>
						{#if unleash.ready}
							<CheckmarkIcon style="color: var(--ax-text-success-decoration); font-size: 1.2rem" />
						{:else}
							<Tooltip
								content="Unleash is not ready, new instances will be online after a minute."
								placement="right"
							>
								<XMarkIcon style="color: var(--ax-text-danger-decoration); font-size: 1.2rem" />
							</Tooltip>
						{/if}
					</dd>
					<dt>Version</dt>
					<dd>
						{#if unleash.version === ''}
							version not available yet.
						{:else}
							{unleash.version}
						{/if}
					</dd>
					<dt>Release Channel</dt>
					<dd>
						<div class="release-channel-row">
							{#if editingReleaseChannel}
								<Select
									size="small"
									label="Release Channel"
									hideLabel
									value={unleash.releaseChannelName ?? ''}
									onchange={(e) => {
										updateReleaseChannel(e);
										editingReleaseChannel = false;
									}}
									disabled={!unleash.ready || releaseChannelLoading || releaseChannels.length === 0}
								>
									{#if releaseChannels.length === 0}
										<option value="">No channels available</option>
									{:else}
										{#each releaseChannels as channel (channel.name)}
											<option value={channel.name}>
												{channel.name} (v{extractVersion(
													channel.currentVersion
												)}{#if channel.lastUpdated}, {channel.lastUpdated}{/if})
											</option>
										{/each}
									{/if}
								</Select>
								{#if releaseChannelLoading}
									<Loader size="small" title="Updating release channel..." />
								{/if}
								<Button
									size="xsmall"
									variant="tertiary-neutral"
									onclick={() => (editingReleaseChannel = false)}
								>
									Cancel
								</Button>
							{:else}
								<span>
									{#if unleash.releaseChannelName}
										{unleash.releaseChannelName}
										{#if unleash.releaseChannel}
											(v{extractVersion(
												unleash.releaseChannel.currentVersion
											)}{#if unleash.releaseChannel.lastUpdated}, <Time
													time={new Date(unleash.releaseChannel.lastUpdated)}
												/>{/if})
										{/if}
									{:else}
										<span style="color: var(--ax-text-neutral-subtle)">Not set</span>
									{/if}
								</span>
								{#if viewerIsMember && unleash.ready}
									<Button
										size="xsmall"
										variant="tertiary-neutral"
										title="Change release channel"
										onclick={() => (editingReleaseChannel = true)}
										icon={PencilIcon}
									/>
								{/if}
							{/if}
						</div>
					</dd>
					<dt>Web UI</dt>
					<dd>
						<ExternalLink href="https://{unleash.webIngress}"
							>https://{unleash.webIngress}</ExternalLink
						>
					</dd>
					<dt>API</dt>
					<dd>
						<span>https://{unleash.apiIngress}</span>
						<CopyButton size="small" variant="action" copyText="https://{unleash.apiIngress}" />
					</dd>
				</dl>
			</section>

			<section aria-labelledby="team-access-heading">
				<Heading as="h2" id="team-access-heading" size="medium" spacing>Team Access</Heading>
				<div class="table-scroll" role="region" aria-label="Team access list">
					<Table size="small">
						<Thead>
							<Tr>
								<Th>Team</Th>
								<Th align="right"></Th>
							</Tr>
						</Thead>
						<Tbody>
							{#each unleash.allowedTeams.edges as { node: team } (team.slug)}
								<Tr>
									<Td>
										<a href="/team/{team.slug}">{team.slug}</a>
									</Td>
									<Td align="right">
										{#if viewerIsMember && team.slug !== teamSlug}
											<Button
												size="small"
												disabled={unleash.ready === false}
												variant="tertiary-neutral"
												aria-label="Remove team access"
												onclick={() => handleRemoveTeamClick(team.slug)}
											>
												{#snippet icon()}
													<TrashIcon style="color:var(--ax-text-danger-decoration)!important" />
												{/snippet}
											</Button>
										{/if}
									</Td>
								</Tr>
							{/each}
						</Tbody>
					</Table>
				</div>
				{#if viewerIsMember}
					<div style="margin-top: var(--ax-space-8);">
						<Button
							title="Add team"
							variant="tertiary"
							disabled={unleash.ready === false}
							size="small"
							onclick={() => (addTeamModalOpen = true)}
							icon={PlusCircleFillIcon}
						>
							Add team
						</Button>
					</div>
				{/if}
			</section>
		</div>

		<div class="layout-sidebar">
			<SurfaceCard title="Metrics">
				<dl class="metrics-list">
					<dt>Toggles</dt>
					<dd>{metrics.toggles}</dd>
					<dt>API clients</dt>
					<dd>{metrics.apiTokens}</dd>
				</dl>
			</SurfaceCard>

			<SurfaceCard title="Utilization">
				<div class="utilization-content">
					<TooltipAlignHack
						content={`Memory usage compared to the requested ${metrics.memoryRequests}.`}
					>
						<IconLabel
							size="medium"
							icon={MemoryIcon}
							label={`${metrics.memoryUtilization.toLocaleString('en', {
								maximumSignificantDigits: 3
							})}% of ${prettyBytes(metrics.memoryRequests, {
								locale: 'en',
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
								binary: true
							})}`}
						/>
					</TooltipAlignHack>
					<TooltipAlignHack content={`CPU usage compared to the requested ${metrics.cpuRequests}.`}>
						<IconLabel
							size="medium"
							icon={CpuIcon}
							label={`${metrics.cpuUtilization.toLocaleString('en', {
								maximumSignificantDigits: 3
							})}% of ${metrics.cpuRequests} CPUs`}
						/>
					</TooltipAlignHack>
				</div>
			</SurfaceCard>

			{#if releaseChannels.length > 0}
				<SurfaceCard title="Available Release Channels">
					<Table size="small">
						<Thead>
							<Tr>
								<Th>Channel</Th>
								<Th>Version</Th>
							</Tr>
						</Thead>
						<Tbody>
							{#each releaseChannels as channel (channel.name)}
								<Tr>
									<Td>{channel.name}</Td>
									<Td>
										{extractVersion(channel.currentVersion)}
										{#if channel.lastUpdated}
											<br /><span class="channel-date"
												><Time time={new Date(channel.lastUpdated)} distance /></span
											>
										{/if}
									</Td>
								</Tr>
							{/each}
						</Tbody>
					</Table>
				</SurfaceCard>
			{/if}
		</div>
	</div>
{:else}
	<div>
		<BodyLong
			><strong>No Unleash found.</strong> Unleash is a feature toggle system, that gives you a great
			overview of all feature toggles across all your applications and services
			<ExternalLink href={docURL('/services/feature-toggling')}
				>Learn more about Unleash and how to get started.</ExternalLink
			>
		</BodyLong>
		<p>
			Enabling Unleash will create a new Unleash server for your team, and cost will be attributed
			to your team.
		</p>
		{#if viewerIsMember}
			<Button
				variant="secondary"
				size="medium"
				onclick={createNewUnleash}
				icon={PlusIcon}
				disabled={creatingUnleash}
				loading={creatingUnleash}
			>
				{creatingUnleash ? 'Creating Unleash...' : 'Enable Unleash'}
			</Button>
		{:else}
			<p>You must be a team member to enable Unleash.</p>
		{/if}
	</div>
{/if}

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		min-width: 0;
	}

	.settings-list dd {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	.release-channel-row {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.channel-date {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}

	.metrics-list {
		display: grid;
		grid-template-columns: 12ch minmax(0, 1fr);
		gap: var(--ax-space-4) var(--ax-space-8);
		margin: 0;
		align-items: baseline;
	}

	.metrics-list dt {
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-neutral-subtle);
	}

	.metrics-list dd {
		margin: 0;
	}

	.utilization-content {
		display: grid;
		gap: var(--ax-space-4);
	}

	@media (max-width: 767px) {
		.settings-list dd {
			margin-bottom: var(--ax-space-8);
		}

		.settings-list dd:last-child {
			margin-bottom: 0;
		}

		.release-channel-row {
			flex-wrap: wrap;
		}
	}
</style>
