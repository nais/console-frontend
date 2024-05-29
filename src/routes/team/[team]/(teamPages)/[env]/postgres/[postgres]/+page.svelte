<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import { docURL } from '$lib/doc';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import { Alert, CopyButton, HelpText, Link, Table, Td, Th, Tr } from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		ExclamationmarkTriangleFillIcon,
		ExternalLinkIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ SqlInstance } = data);
	$: instance = $SqlInstance.data?.team.sqlInstance;
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
	<div class="summary-grid">
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
						€{Math.round(instance.metrics.cost)}
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
							>CPU utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{instance.metrics.cpu.utilization.toFixed(1)}% of {instance.metrics.cpu.cores.toLocaleString()}
						core(s)
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
						{instance.metrics.memory.utilization.toFixed(1)}% of {prettyBytes(
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
						{instance.metrics.disk.utilization.toFixed(1)}% of {prettyBytes(
							instance.metrics.disk.quotaBytes
						)}
					</p>
				</div>
			</div>
		</Card>
	</div>
	<div style="display: grid; gap: 1rem; grid-template-columns: repeat(12, 1fr);">
		<Card columns={6}>
			<h3>Information</h3>
			<div class="grid" style="grid-template-columns: 40% 60%;">
				<p style="display: flex; align-items: center; gap: 0 1rem;">
					State
					<HelpText title="State of the sql instance">
						The state of the SQL instance reflects the current status of the instance. If state is
						RUNNABLE, the instance is healthy and running.
					</HelpText>
				</p>
				<p style="display: flex; align-items: center; gap: 0 0.5rem">
					{#if instance.state === 'RUNNABLE'}
						<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.5rem" />
					{:else}
						<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.5rem" title="yolo" /><span
							style="font-size: small;">Unhealthy state: {instance.state}</span
						>
					{/if}
				</p>
				<p>
					{instance.workload
						? instance.workload.__typename === 'App'
							? 'Application'
							: 'Job'
						: 'Workload'}
				</p>
				<p>
					{#if instance.workload}
						<a
							href="/team/{teamName}/{envName}/{instance.workload.__typename === 'App'
								? 'app'
								: 'job'}/{instance.workload.name}">{instance.workload.name}</a
						>
					{:else}
						<ExclamationmarkTriangleFillIcon
							style="color: var(--a-icon-warning)"
							title="The SQL instance does not belong to any workload"
						/>
						Instance does not belong to any workload
					{/if}
				</p>
				<p>SQL Instance</p>
				<p>
					<a
						href="https://console.cloud.google.com/sql/instances/{postgres}/overview?project={instance.projectId}&supportedpurview=project"
						>{postgres}<ExternalLinkIcon title="Google Cloud Console" font-size="1.5rem" /></a
					>
				</p>
				<p style="display: flex; align-items: center; gap: 0 1rem">
					Config status
					<HelpText title="Status of the sql instance">
						The status reflects the health of the instance and its configuration. If the instance is
						healthy and running with the correct configuration, a checkmark will be displayed. Most
						common issues are misconfigurations. Please consult the 'Config status' for further
						details.
					</HelpText>
				</p>
				<p style="display: flex; align-items: center;">
					{#if instance.isHealthy}
						<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.5rem" />
					{:else if instance.status.conditions.length > 0}
						{#each instance.status.conditions as condition}
							<p>
								{#if condition.type !== 'Ready'}
									<ExclamationmarkTriangleFillIcon
										style="color: var(--a-icon-warning)"
										title="The SQL instance is not ready"
									/>
								{:else}
									<ExclamationmarkTriangleFillIcon
										style="color: var(--a-icon-info)"
										title="The SQL instance has conditions reported"
									/>
								{/if}
								Investigate conditions report(s)
							</p>
						{/each}
					{/if}
				</p>
				<p style="display: flex; align-items: center; gap: 0 1rem">
					HA
					<HelpText title="High availability">
						A SQL instance set up for high availability (HA) is also referred to as a regional
						instance. It consist of primary and secondary zones within the configured region to
						handle database failover. Regional instances do not support shared CPU machine types. If
						the instance is configured for HA, it will display a checkmark.
					</HelpText>
				</p>
				<p>
					{#if instance.highAvailability}
						<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.5rem" />
					{:else}
						<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.5rem" />
					{/if}
				</p>
				<p style="display: flex; align-items: center; gap: 0 1rem">
					Deletion protection
					<HelpText title="Deletion protection for sql instance">
						Deletion protection is a feature used to prevent the accidental deletion of the SQL
						instance. If the Kubernetes resource is deleted, the SQL instance remains unaffected.
						Enabling deletion protection will display a checkmark.
					</HelpText>
				</p>
				<p>
					{#if instance.cascadingDelete}
						<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.5rem" />
					{:else}
						<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.5rem" />
					{/if}
				</p>
				{#if instance.status.publicIpAddress}
					<p>Public IP</p>
					<p>{instance.status.publicIpAddress}</p>
				{/if}
				{#if instance.status.privateIpAddress}
					<p>Private IP</p>
					<p>{instance.status.privateIpAddress}</p>
				{/if}
				<p>Connection name</p>
				<p style="display: flex; align-items: center;">
					<span
						style="width: 90%; text-overflow: ellipsis; white-space: nowrap; overflow: hidden"
						title={instance.connectionName}>{instance.connectionName}</span
					>
					<CopyButton size="small" variant="action" copyText={instance.connectionName.toString()} />
				</p>
				<p>Tier</p>
				<p>{instance.tier}</p>
				<p style="display: flex; align-items: center; gap: 0 1rem">
					Disk autoresize
					<HelpText title="Automatic allocation of disk space for sql instance">
						Disk autoresize is a feature that automatically increases the disk size when the disk
						utilization reaches its limit. If the disk autoresize is enabled, the disk will
						automatically increase in size regardless of the instance's tier or predefined disk
						size.
					</HelpText>
				</p>
				<p>{instance.diskAutoresize}</p>
				{#if instance.diskAutoresize}
					<p style="display: flex; align-items: center; gap: 0 1rem">
						Limit of disk autoresize
						<HelpText title="Limit of disk autoresize">
							The disk autoresize limit is the maximum disk size that the disk can be increased to
							when the disk utilization reaches its limit. The default value is 0, which specifies
							that there is no limit.
						</HelpText>
					</p>
					<p>{instance.diskAutoresizeLimit} GB</p>
				{/if}
			</div>
			<h3 style="margin-top: 1.5rem;">Database</h3>
			{#if instance.database}
				<div class="grid" style="grid-template-columns: 40% 60%;">
					<p style="display: flex; align-items: center; gap: 0 1rem">Name</p>
					<p style="display: flex; align-items: center; gap: 0 1rem">
						{instance.database.name}
					</p>
					<p style="display: flex; align-items: center; gap: 0 1rem">
						Status
						<HelpText title="Limit of disk autoresize">
							The status of the database is heavily dependent on the health of the instance. Most
							common issue is a misconfiguration of the instance or the database itself.
						</HelpText>
					</p>
					<p style="display: flex; align-items: center; gap: 0 1rem">
						{#if instance.database.healthy}
							<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.5rem" />
						{:else}
							<ExclamationmarkTriangleFillIcon
								style="color: var(--a-icon-info)"
								title="The database is not healthy"
							/>
						{/if}
					</p>
					<p style="display: flex; align-items: center; gap: 0 1rem">Charset</p>
					<p style="display: flex; align-items: center; gap: 0 1rem">
						{instance.database.charset}
					</p>
					<p style="display: flex; align-items: center; gap: 0 1rem">Collation</p>
					<p style="display: flex; align-items: center; gap: 0 1rem">
						{instance.database.collation}
					</p>
				</div>
			{:else}
				<p>Instance does not have a database</p>
			{/if}
			<h3 style="margin-top: 1.5rem;">Documentation</h3>
			<ul>
				<li>
					<Link href={docURL('/how-to-guides/persistence/postgres')}
						>How to guide
						<ExternalLinkIcon title="How to guide" font-size="1.5rem" />
					</Link>
				</li>
				<li>
					<Link href={docURL('/how-to-guides/persistence/postgres/#upgrading-major-version')}
						>Upgrading major version
						<ExternalLinkIcon title="Upgrading major version" font-size="1.5rem" />
					</Link>
				</li>
				<li>
					<Link
						href="https://cloud.google.com/products/calculator?hl=en&dl=CiRjYmFlZDQ1MS0yMDQwLTRiNzEtYjUxYi1mNmFlYmJjZTdmNDUQBxokNTQxRjU0QTktN0E1NS00ODVGLUI2RDUtOUFFOUI1QzZCNTNG"
						>Google cost calculator
						<ExternalLinkIcon title="Google cost calculator" font-size="1.5rem" />
					</Link>
				</li>
				<li>
					<Link href={docURL('/how-to-guides/persistence/postgres/#deleting-the-database')}
						>Deletion Protection
						<ExternalLinkIcon title="Deletion Protection" font-size="1.5rem" />
					</Link>
				</li>
			</ul>
		</Card>
		<Card columns={6}>
			<h3 style="margin-bottom: 0.5rem">Backup & Maintenance</h3>
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
						<Td>{instance.backupConfiguration.pointInTimeRecovery ? 'Enabled' : 'Disabled'}</Td>
					</Tr>
					<Tr>
						<Td>Maintenance window:</Td>
						{#if instance.maintenanceWindow && instance.maintenanceWindow.day > 0}
							<Td>
								Every {dayOfWeek[instance.maintenanceWindow.day - 1]} at {String(
									instance.maintenanceWindow.hour
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
			<h3 style="margin-bottom: 0.5rem;">Instance flags</h3>
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
			<h3 style="margin-bottom: 0.5rem;">Users</h3>
			{#if instance.users && instance.users.length > 0}
				<div style="grid-template-columns: 1fr 1fr; margin-bottom: 1.5rem;">
					<Table>
						<Th>Name</Th>
						<Th>
							<Link href={docURL('/how-to-guides/persistence/postgres/#cloud-sql-credentials')}>
								Authentication <ExternalLinkIcon title="Cloud SQL credentials" font-size="1.5rem" />
							</Link>
						</Th>
						{#if instance.users.length > 0}
							{#each instance.users as user}
								<Tr>
									<Td>{user.name}</Td>
									<Td>{user.authentication}</Td>
								</Tr>
							{/each}
						{/if}
					</Table>
				</div>
			{:else}
				<p>Unable to fetch users at the moment</p>
			{/if}
		</Card>
		{#if !instance.isHealthy && instance.status.conditions.length > 0}
			<Card columns={12}>
				<h3 id="conditions">
					Instance config status
					<Link style="float: right" href={docURL('/how-to-guides/persistence/postgres/#faq')}>
						FAQ
						<ExternalLinkIcon title="postgres FAQ" font-size="1.5rem" />
					</Link>
				</h3>
				<div style="margin-bottom: 0.5rem;">
					<h4>Instance</h4>
					{#each instance.status.conditions as condition}
						{#if condition.type !== 'Ready'}
							<Alert variant="warning" size="small">
								<h4>{condition.reason}</h4>
								Message:<strong>{condition.message}</strong> <br />
								Last transaction time: <strong>{condition.lastTransitionTime}</strong>
							</Alert>
						{:else}
							<Alert variant="info" size="small">
								<h4>{condition.reason}</h4>
								Message:<strong>{condition.message}</strong> <br />
								Last transaction time <strong>{condition.lastTransitionTime}</strong>
							</Alert>
						{/if}
					{/each}
				</div>
			</Card>
		{/if}
		{#if instance.database && !instance.database.healthy}
			<Card columns={12}>
				<h3 id="conditions">
					Database config status
					<Link style="float: right" href={docURL('/how-to-guides/persistence/postgres/#faq')}>
						FAQ
						<ExternalLinkIcon title="postgres FAQ" font-size="1.5rem" />
					</Link>
				</h3>
				<div style="margin-bottom: 0.5rem;">
					<h4>Database</h4>
					{#each instance.database.conditions as condition}
						<Alert variant="info" size="small">
							<h4>{condition.reason}</h4>
							Message:<strong>{condition.message}</strong> <br />
							Last transaction time: <strong>{condition.lastTransitionTime}</strong>
						</Alert>
					{/each}
				</div>
			</Card>
		{/if}
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
