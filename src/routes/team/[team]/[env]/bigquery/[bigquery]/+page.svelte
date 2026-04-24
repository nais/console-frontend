<script lang="ts">
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import Time from '$lib/ui/Time.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
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
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { BigQueryDataset: BigQueryDatasetInstance } = $derived(data);
</script>

<GraphErrors errors={$BigQueryDatasetInstance.errors} />
{#if $BigQueryDatasetInstance.data}
	{@const bq = $BigQueryDatasetInstance.data.team.environment.bigQueryDataset}

	<div class="wrapper">
		<div class="content">
			<Heading as="h2" spacing>Dataset Details</Heading>

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
			<Heading as="h3" size="small" spacing>Access</Heading>

			{#if bq.access.edges.length > 0}
				<div class="table-container">
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
									<Td>
										<div class="email">
											<span title={edge.node.email}>{edge.node.email}</span>
											<CopyButton size="xsmall" variant="action" copyText={edge.node.email} />
										</div>
									</Td>
								</Tr>
							{/each}
						</Tbody>
					</Table>
				</div>
			{:else}
				<BodyShort>No workloads with configured access</BodyShort>
			{/if}
		</div>
		<div class="sidebar">
			<div>
				<Heading as="h3" size="small">Owner</Heading>
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
				<Heading as="h3" size="small">Cost Last 30 Days</Heading>
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
		grid-template-columns: minmax(0, 1fr) 300px;
		gap: var(--spacing-layout);
		align-items: start;
		min-width: 0;
	}

	.content {
		min-width: 0;
	}

	.table-container {
		max-width: 100%;
		min-width: 0;
		overflow-x: auto;
	}

	.table-container :global(table) {
		width: max-content;
		min-width: 100%;
	}

	.email {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--ax-space-4);
		min-width: 0;
	}

	.email span {
		min-width: 0;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		min-width: 0;
	}

	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	dl {
		display: grid;
		grid-template-columns: 35% minmax(0, 1fr);
		gap: var(--ax-space-4) var(--ax-space-8);
		min-width: 0;
	}

	dt {
		font-weight: bold;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	dd {
		margin-inline-start: 0;
		min-width: 0;
	}

	@media (max-width: 767px) {
		.wrapper {
			grid-template-columns: 1fr;
		}

		dl {
			grid-template-columns: 1fr;
		}

		dd {
			margin-bottom: var(--ax-space-4);
		}

		dd:last-child {
			margin-bottom: 0;
		}

		.email {
			grid-template-columns: 1fr;
		}

		.email span {
			white-space: normal;
			overflow-wrap: anywhere;
		}
	}
</style>
