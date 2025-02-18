<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/Card.svelte';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { docURL } from '$lib/doc';
	import {
		Alert,
		CopyButton,
		HelpText,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		ExclamationmarkTriangleFillIcon,
		ExternalLinkIcon,
		WalletIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { SqlInstance } = $derived(data);
	let instance = $derived($SqlInstance.data?.team.environment.sqlInstance);
	let postgres = $derived(page.params.postgres);

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
	const dayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
</script>

{#if $SqlInstance.errors}
	{#each distinctErrors($SqlInstance.errors) as error (error)}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if instance}
	<div class="summary-grid">
		<Card columns={3}>
			<SummaryCard
				title="Cost"
				helpText="Total SQL instance cost for the last 30 days"
				color="blue"
			>
				{#snippet icon({ color })}
					<WalletIcon height="32px" width="32px" {color} />
				{/snippet}
				<Cost cost={Math.round(instance.cost.sum)} />
			</SummaryCard>
		</Card>
		<Card columns={3}>
			<SummaryCard
				title="CPU utilization"
				helpText="Current CPU utilization"
				color="green"
				styled={false}
			>
				{#snippet icon()}
					<CircleProgressBar progress={instance.metrics.cpu.utilization / 100} />
				{/snippet}
				{instance.metrics.cpu.utilization.toFixed(1)}% of {instance.metrics.cpu.cores.toLocaleString()}
				core{instance.metrics.cpu.cores > 1 ? 's' : ''}
			</SummaryCard>
		</Card>
		<Card columns={3}>
			<SummaryCard
				title="Memory utilization"
				helpText="Current memory utilization"
				color="green"
				styled={false}
			>
				{#snippet icon()}
					<CircleProgressBar progress={instance.metrics.memory.utilization / 100} />
				{/snippet}
				{instance.metrics.memory.utilization.toFixed(1)}% of {prettyBytes(
					instance.metrics.memory.quotaBytes
				)}
			</SummaryCard>
		</Card>
		<Card columns={3}>
			<SummaryCard
				title="Disk utilization"
				helpText="Current disk utilization"
				color="green"
				styled={false}
			>
				{#snippet icon()}
					<CircleProgressBar progress={instance.metrics.disk.utilization / 100} />
				{/snippet}
				{instance.metrics.disk.utilization.toFixed(1)}% of {prettyBytes(
					instance.metrics.disk.quotaBytes
				)}
			</SummaryCard>
		</Card>
	</div>

	<div style="display: grid; gap: 1rem; grid-template-columns: repeat(12, 1fr);">
		<Card columns={6}>
			<h4>Information</h4>
			<div class="grid" style="grid-template-columns: 40% 60%;">
				<p style="display: flex; align-items: center; gap: 0 1rem;">Version</p>
				<p style="display: flex; align-items: center; gap: 0 0.5rem">
					{instance.version}
				</p>
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
						<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.5rem" /><span
							style="font-size: small;">Unhealthy state: {instance.state}</span
						>
					{/if}
				</p>
				<p>
					{instance.workload?.__typename}
				</p>
				<p>
					{#if instance.workload}
						<WorkloadLink workload={instance.workload} showIcon={true} />
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
						href="https://console.cloud.google.com/sql/instances/{postgres}/overview?project={instance.projectID}&supportedpurview=project"
						>{postgres}<ExternalLinkIcon title="Google Cloud Console" font-size="1.5rem" /></a
					>
				</p>
				<p style="display: flex; align-items: center; gap: 0 1rem">
					Config status
					<HelpText title="Status of the sql instance">
						The status reflects the health of the instance and its configuration. If the instance is
						healthy and running with the correct configuration, a checkmark will be displayed. Most
						common issues are misconfigurations. Please consult the 'Conditions' for further
						details.
					</HelpText>
				</p>
				<p style="display: flex; align-items: center;">
					{#if instance.healthy}
						<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.5rem" />
					{:else}
						<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.5rem" />
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
					{#if instance.connectionName}
						<CopyButton
							size="small"
							variant="action"
							copyText={instance.connectionName.toString()}
						/>
					{/if}
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
			<h4 style="margin-top: 1.5rem;">Database</h4>
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
			<h4 style="margin-top: 1.5rem;">Documentation</h4>
			<ul>
				<li>
					<a href={docURL('/how-to-guides/persistence/postgres')} target="_blank"
						>How to guide
						<ExternalLinkIcon title="How to guide" font-size="1.5rem" />
					</a>
				</li>
				<li>
					<a
						href={docURL('/how-to-guides/persistence/postgres/#upgrading-major-version')}
						target="_blank"
						>Upgrading major version
						<ExternalLinkIcon title="Upgrading major version" font-size="1.5rem" />
					</a>
				</li>
				<li>
					<a
						href="https://cloud.google.com/products/calculator?hl=en&dl=CiRjYmFlZDQ1MS0yMDQwLTRiNzEtYjUxYi1mNmFlYmJjZTdmNDUQBxokNTQxRjU0QTktN0E1NS00ODVGLUI2RDUtOUFFOUI1QzZCNTNG"
						target="_blank"
						>Google cost calculator
						<ExternalLinkIcon title="Google cost calculator" font-size="1.5rem" />
					</a>
				</li>
				<li>
					<a
						href={docURL('/how-to-guides/persistence/postgres/#deleting-the-database')}
						target="_blank"
						>Deletion Protection
						<ExternalLinkIcon title="Deletion Protection" font-size="1.5rem" />
					</a>
				</li>
			</ul>
		</Card>
		<Card columns={6}>
			<h3 style="margin-bottom: 0.5rem">Backup & Maintenance</h3>
			<div style="grid-template-columns: 1fr 1fr; margin-bottom: 1.5rem;">
				<Table zebraStripes size="small">
					<Thead>
						<Tr>
							<Th>Name</Th>
							<Th>Value</Th>
						</Tr>
					</Thead>
					<Tbody>
						<Tr>
							<Td>Automatic backups:</Td>
							<Td>
								{instance.backupConfiguration?.enabled ? 'Enabled' : 'Disabled'}
							</Td>
						</Tr>
						{#if instance.backupConfiguration?.enabled}
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
							<Td>{instance.backupConfiguration?.pointInTimeRecovery ? 'Enabled' : 'Disabled'}</Td>
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
					</Tbody>
				</Table>
			</div>
			<h3 style="margin-bottom: 0.5rem;">Instance flags</h3>
			<div style="margin-bottom: 1.5rem;">
				<Table zebraStripes size="small">
					<Thead>
						<Tr>
							<Th>Name</Th>
							<Th>Value</Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each instance.flags.edges as edge (edge.node.name)}
							<Tr>
								<Td>{edge.node.name}</Td>
								<Td>{edge.node.value}</Td>
							</Tr>
						{:else}
							<p>No flags set</p>
						{/each}
					</Tbody>
				</Table>
			</div>
			<h3 style="margin-bottom: 0.5rem;">Users</h3>
			<div style="grid-template-columns: 1fr 1fr; margin-bottom: 1.5rem;">
				<Table zebraStripes size="small">
					<Thead>
						<Tr>
							<Th>Name</Th>
							<Th>
								<a
									href={docURL('/how-to-guides/persistence/postgres/#cloud-sql-credentials')}
									target="_blank"
								>
									Authentication <ExternalLinkIcon
										title="Cloud SQL credentials"
										font-size="1.5rem"
									/>
								</a>
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each instance.users.edges as edge (edge)}
							<Tr>
								<Td>{edge.node.name}</Td>
								<Td>{edge.node.authentication}</Td>
							</Tr>
						{:else}
							<p>Unable to fetch users at the moment</p>
						{/each}
					</Tbody>
				</Table>
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

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}
</style>
