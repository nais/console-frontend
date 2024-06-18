<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { graphql, type SearchQuery$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import {
		Alert,
		Button,
		CopyButton,
		Heading,
		HelpText,
		Modal,
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
	import type { PageData } from './$houdini';
	import SearchTeam from './SearchTeam.svelte';

	export let data: PageData;
	$: ({ Unleash } = data);
	$: team = $page.params.team;
	$: unleash = $Unleash.data?.team?.unleash.instance;
	$: metrics = $Unleash.data?.team?.unleash.instance?.metrics || {
		apiTokens: 0,
		cpuUtilization: 0,
		cpuRequests: 0,
		memoryUtilization: 0,
		memoryRequests: 0,
		toggles: 0
	};
	$: enabled = $Unleash.data?.team?.unleash.enabled;
	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));

	const createUnleashForTeam = graphql(`
		mutation createUnleashForTeam($team: Slug!) {
			createUnleashForTeam(team: $team) {
				enabled
				instance {
					name
					version
					allowedTeams
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
			team: team
		});

		if ($createUnleashForTeam.errors) {
			console.log($createUnleashForTeam.errors);
			return;
		}

		unleash = $createUnleashForTeam.data?.createUnleashForTeam.instance;
	};

	const updateUnleashForTeam = graphql(`
		mutation updateUnleashForTeam($team: Slug!, $name: String!, $allowedTeams: [String!]) {
			updateUnleashForTeam(team: $team, name: $name, allowedTeams: $allowedTeams) {
				enabled
				instance {
					name
					version
					allowedTeams
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

	const updateUnleash = async (instanceName: string, allowedTeams: string[]) => {
		console.log('update unleash');
		await updateUnleashForTeam.mutate({
			team: team,
			name: instanceName,
			allowedTeams: allowedTeams
		});

		if ($updateUnleashForTeam.errors) {
			console.log($updateUnleashForTeam.errors);
			return;
		}

		unleash = $updateUnleashForTeam.data?.updateUnleashForTeam.instance;
	};

	let removeTeamName = '';
	let removeTeamConfirmOpen = false;

	const removeTeam = async () => {
		const instanceName = unleash?.name || '';
		const allowedTeams = unleash?.allowedTeams.filter((team) => team !== removeTeamName) || [];
		await updateUnleash(instanceName, allowedTeams);
	};

	const removeTeamClickHandler = async (teamName: string) => {
		removeTeamName = teamName;
		removeTeamConfirmOpen = true;
	};

	let addTeamModalOpen = false;
	let addTeamInput = '';

	const validateTeam = (team: string) => {
		if (team.length === 0) {
			return 'Team name cannot be empty';
		}
		return '';
	};

	const addTeamClickHandler = async () => {
		addTeamModalOpen = true;
	};

	const onTeamSelected = (
		node: SearchQuery$result['search']['nodes'][0],
		event: MouseEvent | KeyboardEvent
	) => {
		event.preventDefault();
		switch (node.__typename) {
			case 'Team':
				addTeamInput = node.slug;
				break;
		}
	};

	const addTeam = async () => {
		if (validateTeam(addTeamInput).length > 0) {
			return;
		}

		const teamName = addTeamInput;
		addTeamInput = '';
		addTeamModalOpen = false;

		if (unleash?.allowedTeams.includes(teamName)) {
			return;
		}

		const instanceName = unleash?.name || '';
		const allowedTeams = [...(unleash?.allowedTeams || []), teamName];

		await updateUnleash(instanceName, allowedTeams);
	};

	const addTeamClose = () => {
		addTeamModalOpen = false;
		addTeamInput = '';
	};
</script>

{#if $Unleash.errors}
	{#each distinctErrors($Unleash.errors) as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if $createUnleashForTeam.errors}
	{#each distinctErrors($createUnleashForTeam.errors) as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if !enabled}
	<Alert style="margin-bottom: 1rem;" variant="info">
		Unleash is not enabled for this tenant. Please contact your administrator.
	</Alert>
{:else if unleash}
	<Confirm
		confirmText="Delete"
		variant="danger"
		bind:open={removeTeamConfirmOpen}
		on:confirm={removeTeam}
	>
		<svelte:fragment slot="header">
			<Heading>Remove team</Heading>
		</svelte:fragment>
		<p>
			This will permanently remove the team named <b>{removeTeamName}</b> from
			<b>{unleash.name}</b>.
		</p>

		Are you sure you want to remove this team?
	</Confirm>

	<div class="modal-overrider">
		<Modal bind:open={addTeamModalOpen} width="small">
			<svelte:fragment slot="header">
				<Heading>Give team access to this Unleash</Heading>
			</svelte:fragment>
			<div class="search-container">
				<SearchTeam bind:query={addTeamInput} onSelected={onTeamSelected} />
				<Button variant="primary" size="small" on:click={addTeam}>Add</Button>
				<Button variant="secondary" size="small" on:click={addTeamClose}>Cancel</Button>
			</div>
			<svelte:fragment slot="footer"></svelte:fragment>
		</Modal>
	</div>

	<div class="summary-grid">
		<Card columns={3}>
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #C8C8C8">
					<BulletListIcon font-size="32" />
				</div>
				<div class="summary">
					<h4>
						Toggles
						<HelpText title="">Number of feature toggles in the Unleash server.</HelpText>
					</h4>
					<p class="metric">
						{metrics.toggles}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #C8C8C8">
					<TokenIcon font-size="32" />
				</div>
				<div class="summary">
					<h4>
						API clients
						<HelpText title="API clients">
							Number of API clients that are using the Unleash server.
						</HelpText>
					</h4>
					<p class="metric">
						{metrics.apiTokens}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={metrics.cpuUtilization / 100} />
				</div>
				<div class="summary">
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization"
							>CPU utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{metrics.cpuUtilization.toFixed(1)}% of {metrics.cpuRequests} CPUs
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={metrics.memoryUtilization / 100} />
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current memory utilization"
							>Memory utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{metrics.memoryUtilization.toFixed(1)}% of {prettyBytes(metrics.memoryRequests)}
					</p>
				</div>
			</div>
		</Card>
	</div>
	<div style="display: grid; gap: 1rem; grid-template-columns: repeat(12, 1fr);">
		<Card columns={8}>
			<h3>Information</h3>
			<div class="grid" style="grid-template-columns: 20% 80%;">
				<p>Name</p>
				<p>{unleash.name}</p>

				<p style="display: flex; align-items: center; gap 0 1rem;">Status</p>
				<p style="padding-top: 4px;">
					{#if unleash.ready}
						<CheckmarkIcon style="color: var(--a-icon-success); font-size: 1.2rem" />
					{:else}
						<Tooltip content="Unleash is not ready, new instances will be online after a minute." placement="right">
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
			<Table size="small" style="margin-top: 2rem" zebraStripes>
				<Thead>
					<Tr>
						<Th>Team</Th>
						<Th align="right"></Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each unleash.allowedTeams as team}
						<Tr>
							<Td>
								<a href="/team/{team}">{team}</a>
							</Td>
							<Td style="width:100px;" align="right">
								<Button
									iconOnly
									size="small"
									disabled={unleash.ready === false}
									variant="tertiary-neutral"
									title="Delete key and value"
									on:click={() => removeTeamClickHandler(team)}
								>
									<svelte:fragment slot="icon-left">
										<TrashIcon style="color:var(--a-icon-danger)!important" />
									</svelte:fragment>
								</Button>
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
					on:click={addTeamClickHandler}
				>
					<svelte:fragment slot="icon-left">
						<PlusCircleFillIcon />
					</svelte:fragment>
					Add team
				</Button>
			</p>
			{#if $updateUnleashForTeam.errors}
				{#each distinctErrors($updateUnleashForTeam.errors) as error}
					<Alert style="margin-bottom: 1rem;" variant="error">
						{error}
					</Alert>
				{/each}
			{/if}
		</Card>
	</div>
{:else}
	<div style="">
		<h2>Unleash Feature Toggles</h2>
		<p>
			Enabling Unleash will create a new Unleash server for your team, and cost will be attributed
			to your team.
		</p>
		<Tooltip content="Coming soon...">
			<Button variant="secondary" size="medium" on:click={createNewUnleash}>
				Enable Unleash
				<svelte:fragment slot="icon-left">
					<PlusIcon />
				</svelte:fragment>
			</Button>
		</Tooltip>
	</div>
{/if}

<style>
	.modal-overrider :global(.navds-modal) {
		overflow: visible;
	}

	.modal-overrider :global(.navds-modal__body) {
		overflow: visible;
	}

	.search-container {
		display: flex;
		gap: 0 0.5rem;
	}

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

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}

	.summaryIcon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
		border: 1px solid var(--bg-color);
		border-radius: 5px;
	}

	.summary > h4 {
		display: flex;
		gap: 0.5rem;
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
	}

	.metric {
		font-size: 1.5rem;
		margin: 0;
	}

	.summaryCard {
		display: flex;
		align-items: center;
		gap: 20px;
	}
</style>
