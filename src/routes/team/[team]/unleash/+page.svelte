<script lang="ts">
	import { graphql } from '$houdini';
	import { docURL } from '$lib/doc';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import SummaryCard from '$lib/ui/SummaryCard.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import {
		Alert,
		BodyLong,
		BodyShort,
		Button,
		CopyButton,
		Heading,
		HelpText,
		Loader,
		Select,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import {
		BulletListIcon,
		CheckmarkIcon,
		PencilIcon,
		PlusCircleFillIcon,
		PlusIcon,
		TokenIcon,
		TrashIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import { onDestroy } from 'svelte';
	import type { PageProps } from './$types';
	import TeamSearchModal from './TeamSearchModal.svelte';

	type GraphQLError = {
		message: string;
		extensions?: Record<string, unknown>;
		path?: (string | number)[];
	};

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

{#if !enabled}
	<Alert style="margin-bottom: 1rem;" variant="info">
		Unleash is not enabled for this tenant. Contact your administrator.
	</Alert>
{:else if unleash}
	<BodyLong
		>Unleash is a feature toggle system, that gives you a great overview of all feature toggles
		across all your applications and services
		<ExternalLink href={docURL('/services/feature-toggling')}
			>Learn more about Unleash and how to get started.</ExternalLink
		>
	</BodyLong>
	{#if !unleash.ready}
		<Alert variant="info" size="small" style="margin-bottom: 1rem;">
			<Loader size="small" /> Your Unleash instance is being created. This usually takes about a minute...
		</Alert>
	{/if}
	<!-- TODO: Re-enable after release channel functionality is verified
	{#if !unleash.releaseChannelName}
		<Alert variant="warning" size="small" style="margin-bottom: 1rem;">
			No release channel configured. All Unleash instances are being transitioned to release
			channels for automatic version management. Please select a release channel to ensure your
			instance receives updates.
		</Alert>
	{/if}
	-->
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

	{#if addTeamModalOpen}
		<TeamSearchModal
			bind:open={addTeamModalOpen}
			{addTeam}
			{removeTeam}
			currentTeam={teamSlug}
			teamsWithAccess={unleash.allowedTeams.nodes.map((t) => t.slug)}
		/>
	{/if}

	<Heading level="2" size="large" spacing>
		{unleash.name}
	</Heading>
	<div class="wrapper">
		<div style="display: grid; gap: var(--spacing-layout);">
			<div class="grid" style="grid-template-columns: 20% 80%;">
				<p><strong>Name</strong></p>
				<p>{unleash.name}</p>

				<p style="display: flex; align-items: center; gap 0 1rem;"><strong>Status</strong></p>
				<p style="padding-top: 4px;">
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
				</p>
				<p><strong>Version</strong></p>
				<p>
					{#if unleash.version === ''}
						version not available yet.
					{:else}
						{unleash.version}
					{/if}
				</p>
				<div style="display: flex; align-items: center; gap: 0.5rem;">
					<strong>Release Channel</strong>
					{#if releaseChannels.length > 0}
						<HelpText title="Available Release Channels">
							<dl style="margin: 0; padding: 0;">
								{#each releaseChannels as channel (channel.name)}
									<dt style="font-weight: bold; margin-top: 0.5rem;">{channel.name}</dt>
									<dd style="margin: 0; margin-left: 1rem;">
										Version: {extractVersion(channel.currentVersion)}
										{#if channel.lastUpdated}
											({new Date(channel.lastUpdated).toLocaleDateString()})
										{/if}<br />
										Rollout: {channel.type}
									</dd>
								{/each}
							</dl>
						</HelpText>
					{/if}
				</div>
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
										)}{#if channel.lastUpdated}, {new Date(
												channel.lastUpdated
											).toLocaleDateString()}{/if})
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
									)}{#if unleash.releaseChannel.lastUpdated}, {new Date(
											unleash.releaseChannel.lastUpdated
										).toLocaleDateString()}{/if})
								{/if}
							{:else}
								<span style="color: var(--ax-text-subtle)">Not set</span>
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
				<p><strong>Web UI</strong></p>
				<p>
					<ExternalLink href="https://{unleash.webIngress}"
						>https://{unleash.webIngress}</ExternalLink
					>
				</p>
				<p><strong>API</strong></p>
				<p>
					<span>https://{unleash.apiIngress}</span>
					<CopyButton size="small" variant="action" copyText="https://{unleash.apiIngress}" />
				</p>
				<p><strong>Documentation</strong></p>
				<p>
					<ExternalLink href={docURL('/explanation/feature-toggling')}
						>{docURL('/explanation/feature-toggling')}
					</ExternalLink>
				</p>
			</div>
			<div>
				<Heading level="2" spacing>Team Access</Heading>
				<Table>
					<Thead>
						<Tr>
							<Th>Team</Th>
							<Th align="right"></Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each unleash.allowedTeams.nodes as team (team.slug)}
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
											title="Remove team access"
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
				<p>
					{#if viewerIsMember}
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
					{/if}
				</p>
			</div>
		</div>
		<div class="sidebar">
			<div class="card">
				<SummaryCard
					title="Toggles"
					helpText="Number of feature toggles in the Unleash server"
					color="grey"
				>
					{#snippet icon({ color })}
						<BulletListIcon font-size="32" {color} />
					{/snippet}
					{metrics.toggles}
				</SummaryCard>
			</div>
			<div class="card">
				<SummaryCard
					title="API clients"
					helpText="Number of API clients that are using the Unleash server"
					color="grey"
				>
					{#snippet icon({ color })}
						<TokenIcon font-size="32" {color} />
					{/snippet}
					{metrics.apiTokens}
				</SummaryCard>
			</div>
			<div class="card">
				<div class="summary">
					<div class="heading">
						<Heading level="2" size="xsmall" spacing>Utilization</Heading>
						<HelpText title="Resource Utilization">Resource usage over the past hour</HelpText>
					</div>
					<div>
						<div>
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
						</div>
						<div>
							<TooltipAlignHack
								content={`CPU usage compared to the requested ${metrics.cpuRequests}.`}
							>
								<IconLabel
									size="medium"
									icon={CpuIcon}
									label={`${metrics.cpuUtilization.toLocaleString('en', {
										maximumSignificantDigits: 3
									})}% of ${metrics.cpuRequests} CPUs`}
								/>
							</TooltipAlignHack>
						</div>
					</div>
				</div>
			</div>
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
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.wrapper p {
		margin: 0.2rem 0;
		display: flex;
		align-items: center;
		gap: 0 0.5rem;
	}
	.grid {
		display: grid;
		column-gap: 0.5rem;
		row-gap: 0.5rem;
		align-items: center;
	}

	.release-channel-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.card {
		border: 1px solid var(--ax-border-neutral);
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-20);
		border-radius: 12px;
	}
	.summary {
		width: 100%;
	}
	.heading {
		display: flex;
		justify-content: space-between;
		margin: 0;
		font-size: 1rem;
		color: var(--ax-text-neutral-subtle);
	}
</style>
