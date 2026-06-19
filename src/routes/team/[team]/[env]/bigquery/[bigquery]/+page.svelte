<script lang="ts">
	import Labels from '$lib/domain/labels/Labels.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
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

	<div class="layout-two-column">
		<div class="content">
			<section aria-labelledby="dataset-details-heading">
				<Heading as="h2" id="dataset-details-heading" size="medium" spacing>Dataset Details</Heading
				>

				<BodyShort spacing>{bq.description ? bq.description : 'No description'}</BodyShort>

				<dl class="settings-list">
					<dt>Created</dt>
					<dd><Time time={bq.status.creationTime} dateFormat="d MMM yyyy, HH:mm" /></dd>

					<dt>Last modified</dt>
					<dd>
						<Time time={bq.status.lastModifiedTime || bq.status.creationTime} distance />
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
			</section>

			<section aria-labelledby="access-heading">
				<Heading as="h2" id="access-heading" size="medium" spacing>Access</Heading>

				{#if bq.access.edges.length > 0}
					<div class="table-scroll" role="region" aria-label="BigQuery access table">
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
			</section>
		</div>

		<div class="layout-sidebar">
			<SurfaceCard title="Cost Last 30 Days">
				<BodyShort>
					{bq.cost.sum ? euroValueFormatter(bq.cost.sum) : 'No cost data available'}
				</BodyShort>
			</SurfaceCard>
			<SurfaceCard title="Owner">
				{#if bq.workload}
					<WorkloadLink workload={bq.workload} hideTeam />
				{:else}
					<div class="inline">
						<i>No owner</i>
						<WarningIcon title="This Big Query instance does not belong to any workload" />
					</div>
				{/if}
			</SurfaceCard>
			<Labels labels={bq.labels ?? []} />
		</div>
	</div>
{/if}

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		min-width: 0;
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

	.inline {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	@media (max-width: 767px) {
		.email {
			grid-template-columns: 1fr;
		}

		.email span {
			white-space: normal;
			overflow-wrap: anywhere;
		}
	}
</style>
