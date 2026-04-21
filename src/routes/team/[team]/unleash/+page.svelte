<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { docURL } from '$lib/doc';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import Time from '$lib/ui/Time.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { getContextClient } from '$lib/urql/context';
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
		LineGraphStackedIcon,
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
	import {
		AllowTeamAccessMutation,
		CreateUnleashForTeamMutation,
		RevokeTeamAccessMutation,
		UpdateUnleashInstanceMutation
	} from './unleash';

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

	const client = getContextClient();

	// Local error state for inline mutations (replaces Houdini store-driven errors)
	let createUnleashErrors = $state<GraphQLError[]>([]);
	let updateUnleashErrors = $state<GraphQLError[]>([]);
	let allowTeamAccessErrors = $state<GraphQLError[]>([]);
	let revokeTeamAccessErrors = $state<GraphQLError[]>([]);

	// Derived state
	const unleash = $derived(Unleash.data?.team?.unleash);
	const releaseChannels = $derived(UnleashReleaseChannels.data?.unleashReleaseChannels ?? []);
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

	const errorsFromResult = (
		result: { error?: { graphQLErrors?: readonly { message: string }[]; message: string } } | null
	): GraphQLError[] => {
		if (!result?.error) return [];
		if (result.error.graphQLErrors?.length) {
			return result.error.graphQLErrors.map((e) => ({ message: e.message }));
		}
		return [{ message: result.error.message }];
	};

	// Event handlers
	const updateReleaseChannel = async (e: Event) => {
		if (!e.target || !(e.target instanceof HTMLSelectElement)) return;
		const newChannel = e.target.value;
		if (!newChannel || newChannel === unleash?.releaseChannelName) return;

		releaseChannelLoading = true;
		try {
			const result = await client
				.mutation(UpdateUnleashInstanceMutation, {
					team: teamSlug,
					releaseChannel: newChannel
				})
				.toPromise();

			const errs = errorsFromResult(result);
			if (errs.length) {
				updateUnleashErrors = errs;
			} else {
				await invalidateAll();
			}
		} catch (error) {
			console.error('Network error updating release channel:', error);
		} finally {
			releaseChannelLoading = false;
		}
	};

	const createNewUnleash = async () => {
		creatingUnleash = true;
		const result = await client
			.mutation(CreateUnleashForTeamMutation, { team: teamSlug })
			.toPromise();

		const errs = errorsFromResult(result);
		if (errs.length) {
			createUnleashErrors = errs;
			creatingUnleash = false;
			return;
		}

		await invalidateAll();
		// Start polling until Unleash is ready
		startPolling();
	};

	const startPolling = () => {
		if (pollingInterval) return; // Already polling
		pollingInterval = window.setInterval(() => {
			void invalidateAll();
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

	let removeTeamName = $state('');
	let removeTeamConfirmOpen = $state(false);

	const removeTeam = async (name: string) => {
		const result = await client
			.mutation(RevokeTeamAccessMutation, {
				team: teamSlug,
				revokedTeamSlug: name
			})
			.toPromise();
		const errs = errorsFromResult(result);
		if (errs.length) {
			revokeTeamAccessErrors = errs;
		} else {
			await invalidateAll();
		}
	};

	const handleRemoveTeamClick = (teamName: string) => {
		removeTeamName = teamName;
		removeTeamConfirmOpen = true;
	};

	let addTeamModalOpen = $state(false);

	const addTeam = async (teamName: string) => {
		const result = await client
			.mutation(AllowTeamAccessMutation, {
				team: teamSlug,
				allowedTeamSlug: teamName
			})
			.toPromise();
		const errs = errorsFromResult(result);
		if (errs.length) {
			allowTeamAccessErrors = errs;
		} else {
			await invalidateAll();
		}
	};
</script>

{#if Unleash.errors}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages(Unleash.errors)) as error (error)}
			{error}<br />
		{/each}
	</Alert>
{/if}

{#if UnleashReleaseChannels.errors}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages(UnleashReleaseChannels.errors)) as error (error)}
			{error}<br />
		{/each}
	</Alert>
{/if}

{#if createUnleashErrors.length}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages(createUnleashErrors)) as error (error)}
			{error}<br />
		{/each}
		<Button variant="tertiary" size="small" onclick={() => (createUnleashErrors = [])}>
			Dismiss
		</Button>
	</Alert>
{/if}

{#if updateUnleashErrors.length}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages(updateUnleashErrors)) as error (error)}
			{error}<br />
		{/each}
		<Button variant="tertiary" size="small" onclick={() => (updateUnleashErrors = [])}>
			Dismiss
		</Button>
	</Alert>
{/if}

{#if allowTeamAccessErrors.length}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages(allowTeamAccessErrors)) as error (error)}
			{error}<br />
		{/each}
		<Button variant="tertiary" size="small" onclick={() => (allowTeamAccessErrors = [])}>
			Dismiss
		</Button>
	</Alert>
{/if}

{#if revokeTeamAccessErrors.length}
	<Alert variant="error" size="small" style="margin-bottom: 1rem;">
		{#each new Set(extractErrorMessages(revokeTeamAccessErrors)) as error (error)}
			{error}<br />
		{/each}
		<Button variant="tertiary" size="small" onclick={() => (revokeTeamAccessErrors = [])}>
			Dismiss
		</Button>
	</Alert>
{/if}

{#if !enabled}
	<Alert style="margin-bottom: 1rem;" variant="info">
		Unleash is not enabled for this tenant. Contact your administrator.
	</Alert>
{:else if unleash}
	<BodyLong spacing
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
	{#if !unleash.releaseChannelName}
		<Alert variant="warning" size="small" style="margin-bottom: 1rem;">
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

	{#if addTeamModalOpen}
		<TeamSearchModal
			bind:open={addTeamModalOpen}
			{addTeam}
			{removeTeam}
			currentTeam={teamSlug}
			teamsWithAccess={unleash.allowedTeams.nodes.map((t) => t.slug)}
		/>
	{/if}

	<Heading as="h2" size="large" spacing>
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
											(<Time time={new Date(channel.lastUpdated)} />)
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
				<Heading as="h2" spacing>Team Access</Heading>
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
			<div>
				<div class="sidebar-heading">
					<IconLabel label="Toggles" icon={BulletListIcon} size="large" as="h2" />
					<HelpText title="Toggles">Number of feature toggles in the Unleash server</HelpText>
				</div>
				<div class="sidebar-content">
					<BodyShort>{metrics.toggles}</BodyShort>
				</div>
			</div>
			<div>
				<div class="sidebar-heading">
					<IconLabel label="API clients" icon={TokenIcon} size="large" as="h2" />
					<HelpText title="API clients"
						>Number of API clients that are using the Unleash server</HelpText
					>
				</div>
				<div class="sidebar-content">
					<BodyShort>{metrics.apiTokens}</BodyShort>
				</div>
			</div>
			<div>
				<div class="sidebar-heading">
					<IconLabel label="Utilization" icon={LineGraphStackedIcon} size="large" as="h2" />
					<HelpText title="Resource Utilization">Resource usage over the past hour</HelpText>
				</div>
				<div class="sidebar-content utilization-content">
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
		gap: var(--spacing-layout);
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

	.sidebar-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-2);
	}

	.sidebar-content {
		display: grid;
		gap: var(--ax-space-2);
	}

	.utilization-content {
		gap: var(--ax-space-4);
	}
</style>
