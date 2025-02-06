<script lang="ts">
	import {
		BucketOrderField,
		OrderDirection,
		type BucketOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import PersistenceLink from '$lib/components/PersistenceLink.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
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
	import { BucketIcon, ChevronDownIcon, WalletIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { Buckets } = $derived(data);

	let rows: number = $derived.by(() => $Buckets.variables?.first ?? $Buckets.variables?.last ?? 10);

	let after: string = $derived($Buckets.variables?.after ?? '');
	let before: string = $derived($Buckets.variables?.before ?? '');

	let orderField: keyof typeof BucketOrderField = $derived(
		$Buckets.variables?.orderBy?.field ?? BucketOrderField.NAME
	);

	let orderDirection: keyof typeof OrderDirection = $derived(
		$Buckets.variables?.orderBy?.direction ?? OrderDirection.ASC
	);

	const handleSortDirection = (key: string) => {
		changeQuery({ direction: key as OrderDirection$options });
	};

	const handleSortField = (key: string) => {
		changeQuery({
			field: key as keyof typeof BucketOrderField
		});
	};

	const handleNumberOfRows = (value: number) => {
		changeQuery({ newRows: value, resetPagination: true });
	};

	const changeQuery = (
		params: {
			field?: BucketOrderField$options;
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

<GraphErrors errors={$Buckets.errors} />

{#if $Buckets.data}
	{@const cost = $Buckets.data.team.cost}
	{@const buckets = $Buckets.data.team.buckets}
	<div class="header">
		<IconWithText text="Buckets" icon={BucketIcon} size="large" />
	</div>
	{#if buckets.nodes.length > 0 || $Buckets.data.team.totalCount.pageInfo.totalCount > 0}
		<BodyLong spacing>
			Storage buckets are containers for storing and managing data in the cloud.
			<a href="https://docs.nais.io/persistence/buckets"
				>Learn more about Buckets and how to get started.</a
			>
		</BodyLong>
		<div class="summary-grid">
			<Card columns={3}>
				<SummaryCard
					title="Cost"
					helpText="Total SQL instance cost for the last 30 days"
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
			<div class="list">
				<div class="list-header">
					<div class="count">
						<BodyShort size="small" style="font-weight: bold;">
							{buckets.pageInfo.totalCount} entries
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
											value={BucketOrderField.NAME}
											onselect={(value) => {
												handleSortField(value as string);
											}}>Name</ActionMenuRadioItem
										>

										<ActionMenuRadioItem
											value={BucketOrderField.ENVIRONMENT}
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
				{#each buckets.nodes as instance}
					<div class="list-item">
						<div class="link-wrapper">
							<div class="link">
								<PersistenceLink {instance} />
								<Detail>{instance.environment.name}</Detail>
							</div>
						</div>
						<div class="info">
							{#if instance.workload}
								{@const workload = instance.workload}
								Owner: <WorkloadLink {workload} showIcon={true} />
							{/if}
						</div>
					</div>
				{/each}
			</div>
			{#if buckets.pageInfo.hasPreviousPage || buckets.pageInfo.hasNextPage}
				<Pagination
					page={buckets.pageInfo}
					loaders={{
						loadPreviousPage: () => {
							changeQuery({ before: buckets.pageInfo.startCursor ?? '' });
							Buckets.loadPreviousPage({ last: rows });
						},
						loadNextPage: () => {
							changeQuery({ after: buckets.pageInfo.endCursor ?? '' });
							Buckets.loadNextPage({ first: rows });
						}
					}}
				/>
			{/if}
		</Card>
	{:else}
		<BodyLong
			><strong>No Buckets found.</strong> Storage buckets are containers for storing and managing
			data in the cloud.
			<a href="https://docs.nais.io/persistence/buckets"
				>Learn more about Buckets and how to get started.</a
			>
		</BodyLong>
	{/if}
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
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
			.link-wrapper {
				display: flex;
				gap: 0.3rem;
			}
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

			.link {
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
			.info {
				display: flex;
				gap: var(--a-spacing-1-alt);
				align-items: center;
				font-size: 0.875rem;
				white-space: nowrap;
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
