<script lang="ts">
	import { graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import {
		Alert,
		BodyLong,
		Button,
		CopyButton,
		Heading,
		Link,
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
		ExternalLinkIcon,
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
		Unleash is not enabled for this tenant. Please contact your administrator.
	</Alert>
{:else if unleash}
	<Confirm
		confirmText="Delete"
		variant="danger"
		bind:open={removeTeamConfirmOpen}
		onconfirm={() => removeTeam(removeTeamName)}
	>
		{#snippet header()}
			<Heading>Remove team</Heading>
		{/snippet}
		<p>
			This will permanently remove the team named <b>{removeTeamName}</b> from
			<b>{unleash.name}</b>.
		</p>

		Are you sure you want to remove this team?
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

	<div class="summary-grid">
		<Card columns={3}>
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
		</Card>
		<Card columns={3}>
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
		</Card>
		<Card columns={3}>
			<SummaryCard
				title="CPU utilization"
				helpTextTitle="Current CPU utilization"
				helpText="CPU utilization for the last elapsed hour."
				color="grey"
				styled={false}
			>
				{#snippet icon()}
					<CircleProgressBar progress={metrics.cpuUtilization / 100} />
				{/snippet}
				{metrics.cpuUtilization.toFixed(1)}% of {metrics.cpuRequests} CPUs
			</SummaryCard>
		</Card>
		<Card columns={3}>
			<SummaryCard
				title="Memory utilization"
				helpTextTitle="Current memory utilization"
				helpText="Memory utilization for the last elapsed hour."
				color="grey"
				styled={false}
			>
				{#snippet icon()}
					<CircleProgressBar progress={metrics.memoryUtilization / 100} />
				{/snippet}
				{metrics.memoryUtilization.toFixed(1)}% of {prettyBytes(metrics.memoryRequests)}
			</SummaryCard>
		</Card>
	</div>
	<div style="display: grid; gap: 1rem; grid-template-columns: repeat(12, 1fr);">
		<Card columns={8}>
			<h3 class="heading">
				<Icon icon="Unleash" />
				{unleash.name}
			</h3>

			<div class="grid" style="grid-template-columns: 20% 80%;">
				<p>Name</p>
				<p>{unleash.name}</p>

				<p style="display: flex; align-items: center; gap 0 1rem;">Status</p>
				<p style="padding-top: 4px;">
					{#if unleash.ready}
						<CheckmarkIcon style="color: var(--a-icon-success); font-size: 1.2rem" />
					{:else}
						<Tooltip
							content="Unleash is not ready, new instances will be online after a minute."
							placement="right"
						>
							<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
						</Tooltip>
					{/if}
				</p>
				<p>Version</p>
				<p>
					{#if unleash.version === ''}
						version not available yet.
					{:else}
						{unleash.version}
					{/if}
				</p>
				<p>Web UI</p>
				<p>
					<a href="https://{unleash.webIngress}"
						>https://{unleash.webIngress}<ExternalLinkIcon
							title="Unleash UI"
							font-size="1.5rem"
						/></a
					>
				</p>
				<p>API</p>
				<p>
					<span>https://{unleash.apiIngress}</span>
					<CopyButton size="small" variant="action" copyText="https://{unleash.apiIngress}" />
				</p>
				<p>Documentation</p>
				<p>
					<a href="https://docs.nais.io/explanation/feature-toggling/"
						>https://docs.nais.io/explanation/feature-toggling <ExternalLinkIcon
							title="Unleash documentation"
							font-size="1.5rem"
						/></a
					>
				</p>
			</div>
		</Card>
		<Card columns={4}>
			<h3>Team access</h3>
			<Table size="small" style="margin-top: 2rem">
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
								<BodyLong>
									<Link href="/team/{team.slug}">{team.slug}</Link>
								</BodyLong>
							</Td>
							<Td style="width:100px;" align="right">
								{#if team.slug !== teamSlug}
									<Button
										size="small"
										disabled={unleash.ready === false}
										variant="tertiary-neutral"
										title="Delete key and value"
										onclick={() => removeTeamClickHandler(team.slug)}
									>
										{#snippet icon()}
											<TrashIcon style="color:var(--a-icon-danger)!important" />
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
		</Card>
	</div>
{:else}
	<div style="">
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
	.grid {
		display: grid;
		column-gap: 0.5rem;
		row-gap: 0.5rem;
		align-items: center;
	}

	.grid p {
		margin: 0.2rem 0;
		display: flex;
		align-items: center;
		gap: 0 0.5rem;
	}

	.heading {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}
</style>
