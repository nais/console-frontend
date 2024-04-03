<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { Alert, CopyButton, Link } from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		ExclamationmarkTriangleFillIcon,
		ExternalLinkIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import SqlInstanceMetrics from '../../../postgres/SqlInstanceMetrics.svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ SqlInstance } = data);
	$: instance = $SqlInstance.data?.sqlInstance;
	$: teamName = $page.params.team;
	$: envName = $page.params.env;
	$: postgres = $page.params.postgres;

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $SqlInstance.errors}
	{#each distinctErrors($SqlInstance.errors) as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if instance && instance.id !== PendingValue}
	<div style="display: flex; align-items: center; column-gap: 1rem; margin-bottom: 1rem;">
		<div style="display: flex; align-items: center; column-gap: 0.5rem;">
			SQL Instance:
			<a
				href="https://console.cloud.google.com/sql/instances/{postgres}/overview?project={instance.projectId}&supportedpurview=project"
				>{postgres}<ExternalLinkIcon title="Google Cloud Console" font-size="1.5rem" /></a
			>
		</div>
		<div style="display: flex; align-items: center; column-gap: 0.5rem;">
			<span>Version:</span>
			<span style="font-weight: bold">{instance.type}</span>
		</div>
		<div style="display: flex; align-items: center; column-gap: 0.5rem;">
			<span> Status: </span>
			{#if instance.isHealthy}
				<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
			{:else}
				<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
			{/if}
		</div>
		<div style="display: flex; align-items: center; column-gap: 0.5rem;">
			<span>HA:</span>
			{#if instance.highAvailability}
				<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
			{:else}
				<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
			{/if}
		</div>
	</div>
	<SqlInstanceMetrics
		style="margin-bottom: 1rem;"
		cost={instance.cost}
		cpuUtilization={instance.metrics.cpu.utilization}
		cpuCores={instance.metrics.cpu.cores}
		memoryUtilization={instance.metrics.memory.utilization}
		memoryQuota={instance.metrics.memory.quotaBytes}
		diskUtilization={instance.metrics.disk.utilization}
		diskQuota={instance.metrics.disk.quotaBytes}
	/>
	<div style="display: grid; gap: 1rem; grid-template-columns: repeat(12, 1fr);">
		<Card columns={8}>
			<h3>Information</h3>
			<div class="grid" style="grid-template-columns: 20% 80%;">
				<p>Application:</p>
				<p>
					{#if instance.app}
						Used by application: <a
							href="/team/{teamName}/{envName}/app/{instance.app.name.toString()}"
							>{instance.app.name}</a
						>
					{:else}
						<ExclamationmarkTriangleFillIcon
							style="color: var(--a-icon-warning)"
							title="The SQL instance does not belong to any application resource"
						/>
						The SQL instance does not belong to any application resource
					{/if}
				</p>
				<p>Database version:</p>
				<p>{instance.type}</p>
				<p>Connection name:</p>
				<p style="display: flex; align-items: center;">
					{instance.connectionName}
					<CopyButton size="small" variant="action" copyText={instance.connectionName.toString()} />
				</p>
				<p>Tier:</p>
				<p>{instance.tier}</p>
			</div>
			<h4 style="margin-top: 1.5rem;">Documentation</h4>
			<ul>
				<li>
					<Link
						href="https://doc.nais.io/how-to-guides/persistence/postgres/?h=sql+in#upgrading-major-version"
						>Upgrading major version</Link
					>
				</li>
			</ul>
		</Card>
		<Card columns={4}>
			<h4 style="margin-bottom: 0.5rem;">Databases</h4>
			{#if !instance.databases.length}
				<p>The SQL instance does not have any databases.</p>
			{:else}
				<ul>
					{#each instance.databases as database}
						<li>{database.name}</li>
					{/each}
				</ul>
			{/if}
			<h4 style="margin-bottom: 0.5rem">Backup settings</h4>
			<div class="grid" style="grid-template-columns: 1fr 1fr;">
				<p>Automatic backups:</p>
				<p>
					{instance.backupConfiguration.enabled ? 'Enabled' : 'Disabled'}
				</p>
				{#if instance.backupConfiguration.enabled}
					<p>Backup start time:</p>
					<p>{instance.backupConfiguration.startTime}</p>
					{#if instance.backupConfiguration.retainedBackups}
						<p>Retained backups:</p>
						<p>{instance.backupConfiguration.retainedBackups}</p>
					{/if}
				{/if}
			</div>
		</Card>
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
	}
</style>
