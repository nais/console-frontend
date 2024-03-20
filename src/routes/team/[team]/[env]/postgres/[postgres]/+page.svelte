<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import Card from '$lib/Card.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import {
		HelpText
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import { FloppydiskIcon } from '@nais/ds-svelte-community/icons';

	export let data: PageData;

</script>
	<div class="grid">
		<Card columns={12} borderColor="#91dc75">
			<div class="summaryCard">
				<div class="summary">
					<h4>
						Status
					</h4>
				</div>
			</div>
		</Card>
		<Card columns={3} borderColor="#91dc75">
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
							€{10}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3} borderColor="#83bff6">
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #83bff6">
					<CpuIcon size="32" color="#83bff6" />
				</div>
				<div class="summary">
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization"
						>CPU utilization for the last elapsed hour for team.
						</HelpText>
					</h4>
					<p class="metric">
							{2}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<MemoryIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current memory utilization"
						>Memory utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
							{2}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<FloppydiskIcon font-size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Disk utilization
						<HelpText title="Current memory utilization"
						>Disk utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{2}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard">
				<div class="summary">
					<h4>
						Connections
					</h4>
						<p>2 av 10</p>
				</div>
			</div>
		</Card>
		<Card columns={6} borderColor="#91dc75">
			<div class="summaryCard">
				<div class="summary">
					<h4>
					Info:
					</h4>
					<p>app: a</p>
					<p>{"version: 15"}</p>
						<p>{"address: aura.."}</p>
						<p>database type: micro</p>
						<p>last backup: 2024</p>
				</div>
			</div>
		</Card>
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard">
				<div class="summary">
					<h4>
						Databases:
					</h4>
						<p>{"1"}</p>
						<p>{"2"}</p>
				</div>
			</div>
		</Card>
		<Card columns={12} borderColor="#91dc75">
			<div class="summaryCard">
				<div class="summary">
					<h4>
						Links
					</h4>
						<p>link 1</p>
						<p>link 2</p>
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
        background-color: color-mix(in srgb, var(--bg-color) 10%, white);
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 50px;
        border: 2px solid var(--bg-color);
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
