<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import { Alert, Button, CopyButton, HelpText } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import { graphql } from '$houdini';

	export let data: PageData;
	$: ({ Unleash } = data);
	$: team = $page.params.team;
	$: unleash = $Unleash.data?.team?.unleash;
	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));

	const createUnleashForTeam = graphql(`
		mutation createUnleashForTeam($team: Slug!) {
			createUnleashForTeam(team: $team) {
				name
			}
		}
	`);

	const createNewUnleash = async () => {
		await createUnleashForTeam.mutate({
			team: team
		});

		if ($createUnleashForTeam.errors) {
			console.log($createUnleashForTeam.errors);
		}
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
{:else if unleash}
	<div class="summary-grid">
		<Card columns={3}>
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Cost
						<HelpText title=""></HelpText>
					</h4>
					<p class="metric"></p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={50 / 100} />
				</div>
				<div class="summary">
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization"
							>CPU utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric"></p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={60 / 100} />
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current memory utilization"
							>Memory utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric"></p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={80 / 100} />
				</div>
				<div class="summary">
					<h4>
						Something else
						<HelpText title="Current memory utilization"></HelpText>
					</h4>
					<p class="metric"></p>
				</div>
			</div>
		</Card>
	</div>
	<div style="display: grid; gap: 1rem; grid-template-columns: repeat(12, 1fr);">
		<Card columns={8}>
			<h3>Information</h3>
			<div class="grid" style="grid-template-columns: 20% 80%;">
				<p>Name</p>
				<p>
					{unleash.name}
				</p>
				<p>Version</p>
				<p>
					{unleash.version}
				</p>
				<p>Web UI</p>
				<p>
					<a href={unleash.webIngress}
						>{unleash.webIngress}<ExternalLinkIcon title="Unleash UI" font-size="1.5rem" /></a
					>
				</p>
				<p>API</p>
				<p>
					<span>{unleash.apiIngress}</span>
					<CopyButton size="small" variant="action" copyText={unleash.apiIngress} />
				</p>
				<p>Teams</p>
				<p>
					{unleash.allowedTeams}
				</p>
			</div>
		</Card>
		<Card columns={4}></Card>
	</div>
{:else}
	<div style="">
		<h2>Unleash Feature Toggles</h2>
		<p>
			Enabling Unleash will create a new Unleash server for your team, and cost will be attributed
			to your team.
		</p>
		<Button variant="secondary" size="medium" on:click={createNewUnleash}>
			Enable Unleash
			<svelte:fragment slot="icon-left">
				<PlusIcon />
			</svelte:fragment>
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
