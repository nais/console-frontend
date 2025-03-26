<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/Card.svelte';
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import ErrorIcon from '$lib/icons/ErrorIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Alert, BodyShort, Heading } from '@nais/ds-svelte-community';
	import { CheckmarkIcon, WalletIcon } from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { SqlInstance } = $derived(data);
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
	<BodyShort spacing>
		View in
		<ExternalLink
			href="https://console.cloud.google.com/sql/instances/{postgres}/overview?project={instance.projectID}&supportedpurview=project"
		>
			Google Cloud Console
		</ExternalLink>
	</BodyShort>
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
				{euroValueFormatter(instance.cost.sum)}
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

	<div class="grid">
		<dl>
			<dt>Instance status:</dt>
			<dd>
				{#if instance.state === 'RUNNABLE' && instance.healthy && instance.database?.healthy}
					<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.5rem" />
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
		</dl>
		<div>
			<Heading level="2" size="small">Owner</Heading>
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
		gap: var(--a-spacing-2);
		grid-template-columns: max-content max-content;

		dd {
			margin: 0;
		}
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--a-spacing-4);
	}
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}
</style>
