<script lang="ts">
	import Card from '$lib/Card.svelte';

	import {
		BigQueryDatasetOrderField,
		OrderDirection,
		type BigQueryDatasetOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import Cost from '$lib/components/Cost.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import BigQueryIcon from '$lib/icons/BigQueryIcon.svelte';
	import SortAscendingIcon from '$lib/icons/SortAscendingIcon.svelte';
	import SortDescendingIcon from '$lib/icons/SortDescendingIcon.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { BodyLong, BodyShort, Button, Detail } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental.js';
	import { ChevronDownIcon, WalletIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { BigQuery, teamSlug } = $derived(data);

	let rows: number = $derived.by(
		() => $BigQuery.variables?.first ?? $BigQuery.variables?.last ?? 10
	);

	let after: string = $derived($BigQuery.variables?.after ?? '');
	let before: string = $derived($BigQuery.variables?.before ?? '');

	let orderField: keyof typeof BigQueryDatasetOrderField = $derived(
		$BigQuery.variables?.orderBy?.field ?? BigQueryDatasetOrderField.NAME
	);

	let orderDirection: keyof typeof OrderDirection = $derived(
		$BigQuery.variables?.orderBy?.direction ?? OrderDirection.ASC
	);

	const handleSortDirection = (key: string) => {
		changeQuery({ direction: key as OrderDirection$options });
	};

	const handleSortField = (key: string) => {
		changeQuery({
			field: key as keyof typeof BigQueryDatasetOrderField
		});
	};

	const handleNumberOfRows = (value: number) => {
		changeQuery({ newRows: value, resetPagination: true });
	};

	const changeQuery = (
		params: {
			field?: BigQueryDatasetOrderField$options;
			direction?: OrderDirection$options;
			newRows?: number;
			after?: string;
			before?: string;
			resetPagination?: boolean;
		} = {}
	) => {
		changeParams({
			direction: params.direction || orderDirection,
			field: params.field || orderField,
			rows: params.newRows?.toString() || rows.toString(),
			before: params.resetPagination ? '' : (params.before ?? before),
			after: params.resetPagination ? '' : (params.after ?? after)
		});
	};
</script>

<GraphErrors errors={$BigQuery.errors} />

{#if $BigQuery.data}
	{@const cost = $BigQuery.data.team.cost}
	{@const datasets = $BigQuery.data.team.bigQueryDatasets}
	<div class="header">
		<div class="heading">
			<BigQueryIcon size="32px" />
			<h3>BigQuery datasets</h3>
		</div>
	</div>
	<div class="summary-grid">
		<Card columns={3}>
			<SummaryCard
				title="Cost"
				helpText="Total Big Query cost for team for the last 30 days."
				color="green"
			>
				{#snippet icon({ color })}
					<WalletIcon height="32px" width="32px" {color} />
				{/snippet}
				<Cost cost={cost.daily.sum} />
			</SummaryCard>
		</Card>
	</div>
	<Card columns={12}>
		{#if datasets.nodes.length > 0 || $BigQuery.data.team.totalCount.pageInfo.totalCount > 0}
			<div class="list">
				<div class="list-header">
					<div class="count">
						<BodyShort size="small" style="font-weight: bold;">
							{datasets.pageInfo.totalCount} entries
						</BodyShort>
					</div>
					<div style="display: flex; gap: 1rem;">
						<div style="display: flex; gap: 1rem;">
							<ActionMenu>
								{#snippet trigger(props)}
									<Button
										variant="tertiary-neutral"
										size="small"
										iconPosition="right"
										{...props}
										icon={ChevronDownIcon}
									>
										<span style="font-weight: normal"># of rows</span>
									</Button>
								{/snippet}
								{#key orderField}
									<ActionMenuRadioGroup value={orderField} label="Order by">
										<ActionMenuRadioItem
											value={BigQueryDatasetOrderField.NAME}
											onselect={(value) => {
												handleSortField(value as string);
											}}>Name</ActionMenuRadioItem
										>

										<ActionMenuRadioItem
											value={BigQueryDatasetOrderField.ENVIRONMENT}
											onselect={(value) => {
												handleSortField(value as string);
											}}>Environment</ActionMenuRadioItem
										>
									</ActionMenuRadioGroup>
								{/key}
								<ActionMenuDivider />
								{#key orderDirection}
									<ActionMenuRadioGroup value={orderDirection} label="Sort direction">
										<ActionMenuRadioItem
											value={OrderDirection.ASC}
											onselect={(value) => {
												handleSortDirection(value as string);
											}}
										>
											<div class="icon">
												<SortAscendingIcon size="1rem" />Ascending
											</div>
										</ActionMenuRadioItem>
										<ActionMenuRadioItem
											value={OrderDirection.DESC}
											onselect={(value) => {
												handleSortDirection(value as string);
											}}
										>
											<div class="icon">
												<SortDescendingIcon size="1rem" />Descending
											</div>
										</ActionMenuRadioItem>
									</ActionMenuRadioGroup>
								{/key}
								<ActionMenuDivider />
								{#key rows}
									<ActionMenuRadioGroup value={rows} label="Rows per page">
										<ActionMenuRadioItem
											value="5"
											onselect={(value) => handleNumberOfRows(value as number)}
											>5</ActionMenuRadioItem
										>
										<ActionMenuRadioItem
											value="10"
											onselect={(value) => handleNumberOfRows(value as number)}
											>10</ActionMenuRadioItem
										>
										<ActionMenuRadioItem
											value="25"
											onselect={(value) => handleNumberOfRows(value as number)}
											>25</ActionMenuRadioItem
										>
										<ActionMenuRadioItem
											value="50"
											onselect={(value) => handleNumberOfRows(value as number)}
											>50</ActionMenuRadioItem
										>
									</ActionMenuRadioGroup>
								{/key}
							</ActionMenu>
						</div>
					</div>
				</div>
				{#each datasets.nodes as ds}
					<div class="list-item">
						<div class="activity-link-wrapper">
							<div class="list-link">
								<a href="/team/{teamSlug}/{ds.environment.name}/bigquery/{ds.name}">
									{ds.name}
								</a>
								<Detail>{ds.environment.name}</Detail>
							</div>
						</div>
					</div>
				{/each}
			</div>

			{#if datasets.pageInfo.hasPreviousPage || datasets.pageInfo.hasNextPage}
				<Pagination
					page={datasets.pageInfo}
					loaders={{
						loadPreviousPage: () => {
							changeQuery({ before: datasets.pageInfo.startCursor ?? '' });
							BigQuery.loadPreviousPage({ last: rows });
						},
						loadNextPage: () => {
							changeQuery({ after: datasets.pageInfo.endCursor ?? '' });
							BigQuery.loadNextPage({ first: rows });
						}
					}}
				/>
			{/if}
		{:else}
			<BodyLong
				><strong>No BigQuery datasets found.</strong> BigQuery datasets store structured data
				optimized for analytical workloads.
				<a href="https://docs.nais.io/persistence/bigquery"
					>Learn more about BigQuery datasets and how to get started.</a
				>
			</BodyLong>
		{/if}
	</Card>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin: 1rem 0;
		.heading {
			display: flex;
			align-items: center;
			width: 50%;
			gap: 4px;
			h3 {
				margin: 0;
			}
		}
	}

	.list {
		border: 1px solid var(--a-border-default);
		border-radius: 4px;

		.list-header {
			background-color: var(--active-color);
			border-radius: 4px 4px 0 0;
			border-bottom: 1px solid var(--a-border-default);
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;
		}
		.count {
			font-weight: bold;
		}
		.list-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;

			&:not(:last-of-type) {
				border-bottom: 1px solid var(--a-border-default);
			}

			&:hover {
				background-color: var(--a-surface-subtle);
			}

			.list-link {
				:global(a) {
					font-weight: var(--a-font-weight-bold);
					&:not(:active) {
						color: var(--a-text-defualt);
					}
					text-decoration: none;
					&:hover {
						text-decoration: underline;
					}
				}
			}
		}
	}
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}
</style>
