<script lang="ts">
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import {
		BodyShort,
		CopyButton,
		Heading,
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
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { BigQueryDataset: BigQueryDatasetInstance } = $derived(data);
</script>

<GraphErrors errors={$BigQueryDatasetInstance.errors} />
{#if $BigQueryDatasetInstance.data}
	{@const bq = $BigQueryDatasetInstance.data.team.environment.bigQueryDataset}

	<div class="wrapper">
		<div>
			<Heading level="2" spacing>Dataset description</Heading>

			<BodyShort spacing>{bq.description ? bq.description : 'No description'}</BodyShort>

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
			<Heading level="3" spacing>Access</Heading>

			{#if bq.access.edges.length > 0}
				<Table size="small">
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
				<BodyShort>No workloads with configured access</BodyShort>
			{/if}
		</div>
		<div class="sidebar">
			<div>
				<Heading level="3">Cost</Heading>
				{euroValueFormatter(bq.cost.sum)} last 30 days
			</div>
			<div>
				<Heading level="3">Owner</Heading>
				{#if bq.workload}
					<WorkloadLink workload={bq.workload} />
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
		</div>
	</div>
{/if}

<style>
	/*.email {
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



*/
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--a-spacing-12);
	}

	*.email {
		display: grid;
		grid-template-columns: 1fr 60px;
	}
	.email span {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-10);
	}

	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
		display: flex;
		gap: 0.5em;
		align-items: center;
	}
</style>
