<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import Card from '$lib/Card.svelte';
	import { PendingValue } from '$houdini';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { Alert, CopyButton, HelpText, Skeleton } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import {
		CheckmarkCircleFillIcon,
		CircleSlashFillIcon,
		ExclamationmarkTriangleFillIcon,
		FloppydiskIcon
	} from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import { page } from '$app/stores';

	export let data: PageData;
	$: ({ SqlInstance } = data);
	$: nodes = $SqlInstance.data?.team.sqlInstances.nodes;
	$: teamName = $page.params.team;
	$: envName = $page.params.env;

</script>
{#if $SqlInstance.errors}
	<Alert variant="error">
		{#each $SqlInstance.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else}
	<div class="grid">
		{#if nodes != null && nodes.length > 0}
			{@const postgres = nodes[0]}
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
							{#if postgres.cost !== PendingValue}
								€{Math.round(postgres.cost)}
							{:else}
								<Skeleton variant="text" />
							{/if}
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
							{#if postgres.metrics.cpu.utilization !== PendingValue}
								{Math.round(postgres.metrics.cpu.utilization).toFixed(1)}%
								of {postgres.metrics.cpu.cores.toLocaleString()}
							{:else}
								<Skeleton variant="text" />
							{/if}
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
							{#if postgres.metrics.memory.utilization !== PendingValue}
								{Math.round(postgres.metrics.memory.utilization).toFixed(1)}%
								of {prettyBytes(postgres.metrics.memory.quotaBytes)}
							{:else}
								<Skeleton variant="text" />
							{/if}
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
							{#if postgres.metrics.disk.utilization !== PendingValue}
								{Math.round(postgres.metrics.disk.utilization).toFixed(1)}%
								of {prettyBytes(postgres.metrics.disk.quotaBytes)}
							{:else}
								<Skeleton variant="text" />
							{/if}
						</p>
					</div>
				</div>
			</Card>
			<Card columns={3} borderColor="#91dc75">
				<div class="summaryCard">
					<div class="summary">
						<h4>
							Health status
							{#if postgres.isHealthy}
								<CheckmarkCircleFillIcon
									style="color: var(--a-surface-success); font-size: 1.2rem"
								/>
							{:else}
								<CircleSlashFillIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
							{/if}
						</h4>
					</div>
				</div>
			</Card>
			<Card columns={3} borderColor="#91dc75">
				<div class="summaryCard">
					<div class="summary">
						<h4>
							High availability enabled
							{#if postgres.highAvailability}
								<CheckmarkCircleFillIcon
									style="color: var(--a-surface-success); font-size: 1.2rem"
								/>
							{:else}
								<CircleSlashFillIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
							{/if}
						</h4>
					</div>
				</div>
			</Card>
			<Card columns={3} borderColor="#91dc75">
				<div class="summaryCard">
					<div class="summary">
						<h4>
							Connections 2 av 10
						</h4>
					</div>
				</div>
			</Card>
			<Card columns={3} borderColor="#91dc75">
				<div class="summaryCard">
					<div class="summary">
						<h4>
							Databases: 1,2
						</h4>
					</div>
				</div>
			</Card>
			<Card columns={8} borderColor="#91dc75">
				<h4>
					Information
				</h4>
				{#if postgres.app}
					Used by application: <a
					href="/team/{teamName}/{envName}/app/{postgres.app.name.toString()}">{postgres.app.name}</a>
				{:else}
					<ExclamationmarkTriangleFillIcon
						style="color: var(--a-icon-warning)"
						title="The SQL instance does not belong to any application resource"
					/>
					The SQL instance does not belong to any application resource
				{/if}
				{#if postgres.type}
					<p>Database version: {postgres.type} </p>
				{:else}
					<p>Database type: None</p>
				{/if}
				{#if postgres.connectionName}
					<p style="display: flex; align-items: center;"> Connection name: {postgres.connectionName}
						<CopyButton size="small" variant="action" copyText={postgres.connectionName.toString()} />
					</p>
				{/if}
				{#if postgres.tier}
					<p>Tier: {postgres.tier}</p>
				{/if}
				<p> Last backup: {new Date(2024).toLocaleString()}</p>
			</Card>
			<Card columns={4} borderColor="#91dc75">
				<h4>
					Backup settings
				</h4>
				<p>Automatic backups: {postgres.backupConfiguration.enabled ? 'Enabled' : 'Disabled'}</p>
				<p>Backup start time: {postgres.backupConfiguration.startTime} </p>
				{#if postgres.backupConfiguration.retainedBackups}
					<p>Retained backups: {postgres.backupConfiguration.retainedBackups}</p>
				{/if}
			</Card>
			<Card columns={12} borderColor="#91dc75">
				<h4>
					Links
				</h4>
				<p>link 1</p>
				<p>link 2</p>
			</Card>
		{/if}
	</div>
{/if}

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
