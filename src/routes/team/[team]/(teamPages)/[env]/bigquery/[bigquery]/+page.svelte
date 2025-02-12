<script lang="ts">
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import PersistenceHeader from '$lib/PersistenceHeader.svelte';
	import Time from '$lib/Time.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import {
		CopyButton,
		HelpText,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		ExclamationmarkTriangleFillIcon,
		WalletIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { BigQueryDataset: BigQueryDatasetInstance } = $derived(data);
</script>

{#if $BigQueryDatasetInstance.errors}
	<GraphErrors errors={$BigQueryDatasetInstance.errors} />
{/if}
{#if $BigQueryDatasetInstance.data}
	{@const bq = $BigQueryDatasetInstance.data.team.environment.bigQueryDataset}
	<PersistenceHeader
		environment={bq.environment.name}
		type={bq.__typename}
		name={bq.name}
		path={`/team/${$BigQueryDatasetInstance.data.team.slug}/bigquery`}
		text="All BigQuery datasets"
	/>
	<div class="grid">
		<Card columns={12}>
			<h3>Information</h3>

			<em>{bq.description ? bq.description : 'No description'}</em>

			<h4 style="margin: 1em 0 0 0;"><WalletIcon height="16px" width="16px" /> Cost</h4>
			<p style="margin-left: 1em; margin-top: 0;">
				€{Math.round(bq.cost.sum)} last 30 days
			</p>
			<h4 style="margin-bottom: 0;">Owner</h4>
			<div style="margin-left: 1em; margin-top: 0;">
				{#if bq.workload}
					<WorkloadLink workload={bq.workload} showIcon={true} />
				{:else}
					<div class="inline">
						<i>No owner</i>
						<ExclamationmarkTriangleFillIcon
							style="color: var(--a-icon-warning)"
							title="This Big Query instance does not belong to any workload"
						/>
					</div>
				{/if}
			</div>

			<dl class="status">
				<dt>Created</dt>
				<dd><Time time={bq.status.creationTime} /></dd>

				<dt>Last modified</dt>
				<dd>
					<Time time={bq.status.lastModifiedTime || bq.status.creationTime} />
				</dd>

				<dt>
					Cascading delete
					<HelpText title="Cascading delete"
						>if true, deleting the application will also delete the dataset and all its tables.
					</HelpText>
				</dt>
				<dd>
					{#if bq.cascadingDelete}
						<CheckmarkIcon style="color: var(--a-surface-success)" title="CascadingDelete" />
					{:else}
						<Tooltip content={bq.cascadingDelete.toString()} placement="right">
							<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
						</Tooltip>
					{/if}
				</dd>
			</dl>
		</Card>
		<Card columns={12}>
			<h3>Access</h3>

			{#if bq.access.edges.length > 0}
				<Table size="small" zebraStripes>
					<Thead>
						<Tr>
							<Th>Access</Th>
							<Th>ServiceAccount</Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each bq.access.edges as edge (edge)}
							<Tr>
								<Td>{edge.node.role}</Td>
								<Td
									><div class="email">
										<span title={edge.node.email}>{edge.node.email}</span>
										<CopyButton size="xsmall" variant="action" copyText={edge.node.email} />
									</div>
								</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
			{:else}
				<p>no workloads with configured access</p>
			{/if}
		</Card>
	</div>
{/if}

<style>
	.email {
		display: grid;
		grid-template-columns: 1fr 60px;
	}
	.email span {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	dl.status {
		display: grid;
		align-items: center;
		grid-template-columns: 30% 70%;
	}

	.status {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	dt {
		font-weight: bold;
		display: flex;
		gap: 0.5em;
		align-items: center;
	}
	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
