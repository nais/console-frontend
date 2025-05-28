<script lang="ts">
	import { graphql } from '$houdini';
	import Confirm from '$lib/components/Confirm.svelte';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import {
		Alert,
		BodyShort,
		Button,
		CopyButton,
		Heading,
		HelpText,
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
		PlusCircleFillIcon,
		PlusIcon,
		TokenIcon,
		TrashIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$houdini';
	import TeamSearchModal from './TeamSearchModal.svelte';

	let { data }: PageProps = $props();
	let { Unleash, teamSlug } = $derived(data);
	let unleash = $derived($Unleash.data?.team?.unleash);
	let metrics = $derived(
		$Unleash.data?.team?.unleash?.metrics || {
			apiTokens: 0,
			cpuUtilization: 0,
			cpuRequests: 0,
			memoryUtilization: 0,
			memoryRequests: 0,
			toggles: 0
		}
	);
	let enabled = $derived(true);

	const createUnleashForTeam = graphql(`
		mutation createUnleashForTeam($team: Slug!) {
			createUnleashForTeam(input: { teamSlug: $team }) {
				unleash {
					name
					version
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

	const createNewUnleash = async () => {
		await createUnleashForTeam.mutate({
			team: teamSlug
		});

		if ($createUnleashForTeam.errors) {
			return;
		}

		Unleash.fetch({ policy: 'CacheAndNetwork' });
	};

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

	const removeTeamClickHandler = async (teamName: string) => {
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

<GraphErrors errors={$Unleash.errors} />
<GraphErrors errors={$createUnleashForTeam.errors} />

{#if !enabled}
	<Alert style="margin-bottom: 1rem;" variant="info">
		Unleash is not enabled for this tenant. Contact your administrator.
	</Alert>
{:else if unleash}
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
							<XMarkIcon
								style="color: var(--ax-text-danger-icon, --a-icon-danger); font-size: 1.2rem"
							/>
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
									{#if team.slug !== teamSlug}
										<Button
											size="small"
											disabled={unleash.ready === false}
											variant="tertiary-neutral"
											title="Delete key and value"
											onclick={() => removeTeamClickHandler(team.slug)}
										>
											{#snippet icon()}
												<TrashIcon
													style="color:var(--ax-text-danger-icon, --a-icon-danger)!important"
												/>
											{/snippet}
										</Button>
									{/if}
								</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
				<p>
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
		<p>
			Enabling Unleash will create a new Unleash server for your team, and cost will be attributed
			to your team.
		</p>
		<Button variant="secondary" size="medium" onclick={createNewUnleash} icon={PlusIcon}>
			Enable Unleash
		</Button>
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
		gap: var(--ax-space-16, --a-spacing-4);
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

	.card {
		background-color: var(--ax-bg-sunken, --a-surface-subtle);
		padding: var(--ax-space-20, --a-spacing-5);
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
		color: var(--color-text-secondary);
	}
</style>
