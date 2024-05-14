<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import { Alert, Button, CopyButton, HelpText, Tooltip } from '@nais/ds-svelte-community';
	import {
		ExternalLinkIcon,
		PlusIcon,
		BulletListIcon,
		TokenIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import { graphql } from '$houdini';
	import prettyBytes from 'pretty-bytes';

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
				<div class="summaryIcon" style="--bg-color: #C8C8C8">
					<BulletListIcon font-size="32" />
				</div>
				<div class="summary">
					<h4>
						Toggles
						<HelpText title="">Number of feature toggles in the Unleash server.</HelpText>
					</h4>
					<p class="metric">
						{unleash.metrics.toggles}
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
						{unleash.metrics.apiTokens}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={unleash.metrics.cpuUtilization / 100} />
				</div>
				<div class="summary">
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization"
							>CPU utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{unleash.metrics.cpuUtilization.toFixed(1)}% of {unleash.metrics.cpuRequests} CPUs
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={unleash.metrics.memoryUtilization / 100} />
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current memory utilization"
							>Memory utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{unleash.metrics.memoryUtilization.toFixed(1)}% of {prettyBytes(
							unleash.metrics.memoryRequests
						)}
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
				<p>
					{unleash.name}
				</p>
				<p>Version</p>
				<p>
					{unleash.version}
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
			<ul>
				{#each unleash.allowedTeams as team}
					<li>
						<a href="/team/{team}">{team}</a>
					</li>
				{/each}
			</ul>
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
			<Button variant="secondary" size="medium" on:click={createNewUnleash} disabled>
				Enable Unleash
				<svelte:fragment slot="icon-left">
					<PlusIcon />
				</svelte:fragment>
			</Button>
		</Tooltip>
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
