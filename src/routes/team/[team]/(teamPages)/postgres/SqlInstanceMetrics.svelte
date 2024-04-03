<script lang="ts">
	import Card from '$lib/Card.svelte';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import { HelpText } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';

	export let cost: number;
	export let cpuUtilization: number;
	export let cpuCores: number;
	export let memoryUtilization: number;
	export let memoryQuota: number;
	export let diskUtilization: number;
	export let diskQuota: number;
	export let cols: number = 3;
	let customStyle = $$props.style;
</script>

<div class="grid" style={customStyle}>
	<Card columns={cols}>
		<div class="summaryCard">
			<div class="summaryIcon" style="--bg-color: #91dc75">
				<CostIcon size="32" color="#91dc75" />
			</div>
			<div class="summary">
				<h4>
					Cost
					<HelpText title="">Total SQL instance cost for the last 30 days.</HelpText>
				</h4>
				<p class="metric">
					€{Math.round(cost)}
				</p>
			</div>
		</div>
	</Card>
	<Card columns={cols}>
		<div class="summaryCard">
			<div>
				<CircleProgressBar progress={cpuUtilization / 100} />
			</div>
			<div class="summary">
				<h4>
					CPU utilization
					<HelpText title="Current CPU utilization"
						>CPU utilization for the last elapsed hour for team.
					</HelpText>
				</h4>
				<p class="metric">
					{cpuUtilization.toFixed(1)}% of {cpuCores.toLocaleString()}
					core(s)
				</p>
			</div>
		</div>
	</Card>
	<Card columns={cols}>
		<div class="summaryCard">
			<div>
				<CircleProgressBar progress={memoryUtilization / 100} />
			</div>
			<div class="summary">
				<h4>
					Memory utilization
					<HelpText title="Current memory utilization"
						>Memory utilization for the last elapsed hour.
					</HelpText>
				</h4>
				<p class="metric">
					{memoryUtilization.toFixed(1)}% of {prettyBytes(memoryQuota)}
				</p>
			</div>
		</div>
	</Card>
	<Card columns={cols}>
		<div class="summaryCard">
			<div>
				<CircleProgressBar progress={diskUtilization / 100} />
			</div>
			<div class="summary">
				<h4>
					Disk utilization
					<HelpText title="Current memory utilization"
						>Disk utilization for the last elapsed hour.
					</HelpText>
				</h4>
				<p class="metric">
					{diskUtilization.toFixed(1)}% of {prettyBytes(diskQuota)}
				</p>
			</div>
		</div>
	</Card>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
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
