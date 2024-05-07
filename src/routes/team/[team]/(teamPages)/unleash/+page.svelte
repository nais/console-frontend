<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import Card from '$lib/Card.svelte';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import { Alert, CopyButton, HelpText } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ Unleash } = data);
	$: team = $Unleash.data?.team;
	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $Unleash.errors}
	{#each distinctErrors($Unleash.errors) as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if team}
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
						<HelpText title="Current memory utilization"
							>
						</HelpText>
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
					{team.unleash.name}
				</p>
				<p>Version</p>
				<p>
					{team.unleash.version}
				</p>
				<p>Web UI</p>
				<p>
					<a href={team.unleash.webIngress}
						>{team.unleash.webIngress}<ExternalLinkIcon title="Unleash UI" font-size="1.5rem" /></a
					>
				</p>
				<p>API</p>
				<p>
					<span>{team.unleash.apiIngress}</span>
					<CopyButton size="small" variant="action" copyText={team.unleash.apiIngress} />
				</p>
				<p>Teams</p>
				<p>
					{team.unleash.allowedTeams}
				</p>
			</div>
		</Card>
		<Card columns={4}></Card>
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
