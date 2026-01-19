<script lang="ts">
	import { page } from '$app/state';
	import CircleProgressBar from '$lib/ui/CircleProgressBar.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import SummaryCard from '$lib/ui/SummaryCard.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ErrorIcon from '$lib/icons/ErrorIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { Alert, Heading } from '@nais/ds-svelte-community';
	import { CheckmarkIcon, WalletIcon } from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { SqlInstance, viewerIsMember } = $derived(data);
	let instance = $derived($SqlInstance.data?.team.environment.sqlInstance);
	let postgres = $derived(page.params.postgres);

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $SqlInstance.errors}
	{#each distinctErrors($SqlInstance.errors) as error (error)}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if instance}
	<div class="summary-grid">
		<div class="card">
			<SummaryCard
				title="Cost"
				helpText="Total SQL instance cost for the last 30 days"
				color="grey"
			>
				{#snippet icon({ color })}
					<WalletIcon height="32px" width="32px" {color} />
				{/snippet}
				{euroValueFormatter(instance.cost.sum)}
			</SummaryCard>
		</div>
		<div class="card">
			<SummaryCard
				title="CPU utilization"
				helpText="Current CPU utilization"
				color="grey"
				styled={false}
			>
				{#snippet icon()}
					<CircleProgressBar progress={instance.metrics.cpu.utilization / 100} />
				{/snippet}
				{instance.metrics.cpu.utilization.toFixed(1)}% of {instance.metrics.cpu.cores.toLocaleString()}
				core{instance.metrics.cpu.cores > 1 ? 's' : ''}
			</SummaryCard>
		</div>
		<div class="card">
			<SummaryCard
				title="Memory utilization"
				helpText="Current memory utilization"
				color="grey"
				styled={false}
			>
				{#snippet icon()}
					<CircleProgressBar progress={instance.metrics.memory.utilization / 100} />
				{/snippet}
				{instance.metrics.memory.utilization.toFixed(1)}% of {prettyBytes(
					instance.metrics.memory.quotaBytes
				)}
			</SummaryCard>
		</div>
		<div class="card">
			<SummaryCard
				title="Disk utilization"
				helpText="Current disk utilization"
				color="grey"
				styled={false}
			>
				{#snippet icon()}
					<CircleProgressBar progress={instance.metrics.disk.utilization / 100} />
				{/snippet}
				{instance.metrics.disk.utilization.toFixed(1)}% of {prettyBytes(
					instance.metrics.disk.quotaBytes
				)}
			</SummaryCard>
		</div>
	</div>

	<div class="grid">
		<div>
			<dl>
				<dt>Instance status:</dt>
				<dd>
					{#if instance.state === 'RUNNABLE'}
						<CheckmarkIcon style="color: var(--ax-text-success-subtle); font-size: 1.5rem" />
					{:else}
						<ErrorIcon class="text-aligned-icon" /> Not healthy. Check status in <ExternalLink
							href="https://console.cloud.google.com/sql/instances/{postgres}/overview?project={instance.projectID}&supportedpurview=project"
						>
							Google Cloud Console
						</ExternalLink>
					{/if}
				</dd>
				<dt>Version:</dt>
				<dd>{instance.version}</dd>
				<dt>Tier:</dt>
				<dd>{instance.tier}</dd>
				{#if viewerIsMember}
					<dt>Console:</dt>
					<dd>
						<ExternalLink
							href="https://console.cloud.google.com/sql/instances/{postgres}/overview?project={instance.projectID}&supportedpurview=project"
						>
							Google Cloud Console
						</ExternalLink>
					</dd>
					{#if instance.auditLog?.logUrl}
						<dt>Audit Logs:</dt>
						<dd>
							<ExternalLink href={instance.auditLog.logUrl}>View Logs</ExternalLink>
						</dd>
					{/if}
				{/if}
			</dl>

			<Heading as="h3" spacing>Issues</Heading>
			<List>
				{#each $SqlInstance.data?.team.environment.sqlInstance.issues.edges ?? [] as edge (edge.node.id)}
					<IssueListItem item={edge.node} />
				{:else}
					<span>No issues found</span>
				{/each}
			</List>
		</div>
		<div>
			<Heading as="h2" size="small">Owner</Heading>
			{#if instance.workload}
				<WorkloadLink workload={instance.workload} />
			{:else}
				<WarningIcon title="The SQL instance does not belong to any workload" />
				Instance does not belong to any workload
			{/if}
		</div>
	</div>
{/if}

<style>
	dl {
		display: grid;
		gap: var(--ax-space-8);
		grid-template-columns: max-content max-content;

		dd {
			margin: 0;
		}
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--ax-space-16);
	}
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}
	.card {
		border: 1px solid var(--ax-border-neutral);
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-20);
		border-radius: 12px;
	}
</style>
