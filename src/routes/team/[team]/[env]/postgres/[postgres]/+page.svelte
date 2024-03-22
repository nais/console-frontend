<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { Alert, CopyButton, HelpText } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import {
		CheckmarkCircleFillIcon,
		CircleSlashFillIcon,
		ExclamationmarkTriangleFillIcon,
		FloppydiskIcon
	} from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';
	import CircleProgressBar from '../CircleProgressBar.svelte';

	export let data: PageData;
	$: ({ SqlInstance } = data);
	$: instance = $SqlInstance.data?.sqlInstance;
	$: teamName = $page.params.team;
	$: envName = $page.params.env;
	$: postgres = $page.params.postgres;
</script>

{#if $SqlInstance.errors}
	<Alert variant="error">
		{#each $SqlInstance.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if instance && instance.id !== PendingValue}
	<div style="display: flex; align-items: center; column-gap: 1rem; margin-bottom: 1rem;">
		<div style="display: flex; align-items: center; column-gap: 0.5rem;" >
			SQL Instance:
			<a
				href="https://console.cloud.google.com/sql/instances/{postgres}/overview?project={instance.projectId}&supportedpurview=project"
				>{postgres}<ExternalLinkIcon title="Google Cloud Console" font-size="1.5rem" /></a
			>
		</div>
		<div style="display: flex; align-items: center; column-gap: 0.5rem;" >
			<span>Version:</span>
			<span style="font-weight: bold">{instance.type}</span>
		</div>
		<div style="display: flex; align-items: center; column-gap: 0.5rem;" >
			<span> Status: </span>
			{#if instance.isHealthy}
				<CheckmarkCircleFillIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
			{:else}
				<CircleSlashFillIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
			{/if}
		</div>
		<div style="display: flex; align-items: center; column-gap: 0.5rem;" >
			{#if instance.highAvailability}
				<span>HA:</span>
				<CheckmarkCircleFillIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
			{/if}
		</div>
	</div>
	<div class="grid">
		<Card columns={3}>
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
						€{Math.round(instance.cost)}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={instance.metrics.cpu.utilization / 100} />
				</div>
				<div class="summary">
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization"
							>CPU utilization for the last elapsed hour for team.
						</HelpText>
					</h4>
					<p class="metric">
						{Math.round(instance.metrics.cpu.utilization).toFixed(1)}% of {instance.metrics.cpu.cores.toLocaleString()}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={instance.metrics.memory.utilization / 100} />
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current memory utilization"
							>Memory utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{Math.round(instance.metrics.memory.utilization).toFixed(1)}% of {prettyBytes(
							instance.metrics.memory.quotaBytes
						)}
					</p>
				</div>
			</div>
		</Card>

		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={instance.metrics.disk.utilization / 100} />
				</div>
				<div class="summary">
					<h4>
						Disk utilization
						<HelpText title="Current memory utilization"
							>Disk utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{Math.round(instance.metrics.disk.utilization).toFixed(1)}% of {prettyBytes(
							instance.metrics.disk.quotaBytes
						)}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={8}>
			<h4>Information</h4>
			{#if instance.app}
				Used by application: <a href="/team/{teamName}/{envName}/app/{instance.app.name.toString()}"
					>{instance.app.name}</a
				>
			{:else}
				<ExclamationmarkTriangleFillIcon
					style="color: var(--a-icon-warning)"
					title="The SQL instance does not belong to any application resource"
				/>
				The SQL instance does not belong to any application resource
			{/if}
			{#if instance.type}
				<p>Database version: {instance.type}</p>
			{:else}
				<p>Database type: None</p>
			{/if}
			{#if instance.connectionName}
				<p style="display: flex; align-items: center;">
					Connection name: {instance.connectionName}
					<CopyButton size="small" variant="action" copyText={instance.connectionName.toString()} />
				</p>
			{/if}
			{#if instance.tier}
				<p>Tier: {instance.tier}</p>
			{/if}
			<p>Last backup: {new Date(2024).toLocaleString()}</p>
		</Card>
		<Card columns={4}>
			<h4>Backup settings</h4>
			<p>Automatic backups: {instance.backupConfiguration.enabled ? 'Enabled' : 'Disabled'}</p>
			<p>Backup start time: {instance.backupConfiguration.startTime}</p>
			{#if instance.backupConfiguration.retainedBackups}
				<p>Retained backups: {instance.backupConfiguration.retainedBackups}</p>
			{/if}
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div class="summary">
					<h4>Connections 2 av 10</h4>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div class="summary">
					<h4>Databases: 1,2</h4>
				</div>
			</div>
		</Card>
		<Card columns={12}>
			<h4>Links</h4>
			<p>link 1</p>
			<p>link 2</p>
		</Card>
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
