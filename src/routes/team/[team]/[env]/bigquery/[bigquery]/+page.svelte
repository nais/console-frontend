<script lang="ts">
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import {
		BodyShort,
		CopyButton,
		Heading,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { CheckmarkIcon, XMarkIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { BigQueryDataset: BigQueryDatasetInstance } = $derived(data);
</script>

<GraphErrors errors={$BigQueryDatasetInstance.errors} />
{#if $BigQueryDatasetInstance.data}
	{@const bq = $BigQueryDatasetInstance.data.team.environment.bigQueryDataset}

	<div class="wrapper">
		<div>
			<Heading level="2" spacing>Dataset Details</Heading>

			<BodyShort spacing>{bq.description ? bq.description : 'No description'}</BodyShort>

			<dl>
				<dt>Created</dt>
				<dd><Time time={bq.status.creationTime} /></dd>

				<dt>Last modified</dt>
				<dd>
					<Time time={bq.status.lastModifiedTime || bq.status.creationTime} />
				</dd>

				<dt>Cascading delete</dt>
				<dd>
					{#if bq.cascadingDelete}
						<IconLabel
							label="Deleting the application will also remove the dataset and all its tables."
						>
							{#snippet icon()}
								<TooltipAlignHack content="Cascading delete">
									<CheckmarkIcon
										style="color: var(--ax-text-success-subtle)"
										title="CascadingDelete"
									/>
								</TooltipAlignHack>
							{/snippet}
						</IconLabel>
					{:else}
						<IconLabel label="Deleting the application will NOT remove the dataset.">
							{#snippet icon()}
								<TooltipAlignHack content="Cascading delete">
									<XMarkIcon style="color: var(--ax-text-danger-decoration);" />
								</TooltipAlignHack>
							{/snippet}
						</IconLabel>
					{/if}
				</dd>
			</dl>
			<Heading level="3" size="small" spacing>Access</Heading>

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
				<Heading level="3" size="small">Owner</Heading>
				{#if bq.workload}
					<WorkloadLink workload={bq.workload} />
				{:else}
					<div class="inline">
						<i>No owner</i>
						<WarningIcon title="This Big Query instance does not belong to any workload" />
					</div>
				{/if}
			</div>
			<div>
				<Heading level="3" size="small">Cost Last 30 Days</Heading>
				<BodyShort>
					{bq.cost.sum ? euroValueFormatter(bq.cost.sum) : 'No cost data available'}
				</BodyShort>
			</div>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
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
		gap: var(--spacing-layout);
	}

	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	dl {
		display: grid;
		grid-template-columns: 35% 65%;
	}

	dt {
		font-weight: bold;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	dd {
		margin-inline-start: 0;
	}
</style>
