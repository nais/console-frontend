<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { Alert, CopyButton, Link, Tooltip, Table, Th, Tr, Td } from '@nais/ds-svelte-community';
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
	const dayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
</script>

{#if $SqlInstance.errors}
	{#each distinctErrors($SqlInstance.errors) as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if instance && instance.id !== PendingValue}
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
		<Card columns={6}>
			<h3>Information</h3>
			<div class="grid" style="grid-template-columns: 30% 70%;">
				<p>Application:</p>
				<p>
					{#if instance.app}
						<a
							href="/team/{teamName}/{envName}/app/{instance.app.name.toString()}"
							>{instance.app.name}</a
						>
					{:else}
						<ExclamationmarkTriangleFillIcon
							style="color: var(--a-icon-warning)"
							title="The SQL instance does not belong to any app"
						/>
						The SQL instance does not belong to any app
					{/if}
				</p>
				<p>SQL Instance:</p>
				<p>
					<a
						href="https://console.cloud.google.com/sql/instances/{postgres}/overview?project={instance.projectId}&supportedpurview=project"
						>{postgres}<ExternalLinkIcon title="Google Cloud Console" font-size="1.5rem" /></a
					>
				</p>
				<p>Version:</p>
				<p style="font-weight: bold">{instance.type}</p>
				<p>Status:</p>
				<p>
					<Tooltip content="SQL instance is ready or not" placement="right">
						{#if instance.isHealthy}
							<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.5rem;" />
						{:else}
							{#each instance.status.conditions as condition}
								<Alert variant="warning">
									{condition.reason}: {condition.message}
								</Alert>
							{/each}
						{/if}
					</Tooltip>
				</p>
				<p>HA:</p>
				<p>
					{#if instance.highAvailability}
						<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.5rem" />
					{:else}
						<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.5rem" />
					{/if}
				</p>
				<p>IP address:</p>
				<p>{instance.status.publicIpAddress}</p>
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
						href="https://docs.nais.io/how-to-guides/persistence/postgres"
						>How to guide</Link
					>
				<li>
					<Link
						href="https://doc.nais.io/how-to-guides/persistence/postgres/#upgrading-major-version"
						>Upgrading major version</Link
					>
				</li>
				<li>
					<Link
						href="https://cloud.google.com/products/calculator?hl=en&dl=CiRjYmFlZDQ1MS0yMDQwLTRiNzEtYjUxYi1mNmFlYmJjZTdmNDUQBxokNTQxRjU0QTktN0E1NS00ODVGLUI2RDUtOUFFOUI1QzZCNTNG"
						>Google cost calculator</Link
					>
				</li>
			</ul>
		</Card>
		<Card columns={6}>
			<h4 style="margin-bottom: 0.5rem">Backup & Maintenance</h4>
			<div style="grid-template-columns: 1fr 1fr; margin-bottom: 1.5rem;">
				<Table>
					<Th>Name</Th>
					<Th>Value</Th>
					<Tr>
						<Td>Automatic backups:</Td>
						<Td>
							{instance.backupConfiguration.enabled ? 'Enabled' : 'Disabled'}
						</Td>
					</Tr>
					{#if instance.backupConfiguration.enabled}
						<Tr>
							<Td>Backup start time:</Td>
							<Td>{instance.backupConfiguration.startTime}</Td>
						</Tr>
						{#if instance.backupConfiguration.retainedBackups}
							<Tr>
								<Td>Retained backups:</Td>
								<Td>{instance.backupConfiguration.retainedBackups}</Td>
							</Tr>
						{/if}
					{/if}
					<Tr>
						<Td>Point in time recovery:</Td>
						<Td>{instance.pointInTimeRecovery ? 'Enabled' : 'Disabled'}</Td>
					</Tr>
					<Tr>
						<Td>Maintenance window:</Td>
						{#if instance.maintenance && instance.maintenance.day > 0}
							<Td>
								Every {dayOfWeek[instance.maintenance.day - 1]} at {String(
									instance.maintenance.hour
								).padStart(2, '0')}:00
							</Td>
						{:else}
							<Td>Not specified</Td>
						{/if}
					</Tr>
					<Tr>
						<Td>Maintenance version:</Td>
						{#if instance.maintenanceVersion}
							<Td>
								{instance.maintenanceVersion}
							</Td>
						{:else}
							<Td>Not specified</Td>
						{/if}
					</Tr>
				</Table>
			</div>
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
			<h4 style="margin-bottom: 0.5rem;">Database flags</h4>
			<div style="margin-bottom: 1.5rem;">
				{#if instance.flags.length}
					<Table>
						<Th>Name</Th>
						<Th>Value</Th>
					{#each instance.flags as flag}
							<Tr>
								<Td>{flag.name}</Td>
								<Td>{flag.value}</Td>
							</Tr>
					{/each}
					</Table>
				{:else}
					<p>No flags set</p>
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
