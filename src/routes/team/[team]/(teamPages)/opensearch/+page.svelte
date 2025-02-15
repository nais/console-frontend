<script lang="ts">
	import {
		OpenSearchOrderField,
		OrderDirection,
		type OpenSearchOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import PersistenceCost from '$lib/components/PersistenceCost.svelte';
	import PersistenceLink from '$lib/components/PersistenceLink.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
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
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { OpenSearch } = $derived(data);

	let rows: number = $derived.by(
		() => $OpenSearch.variables?.first ?? $OpenSearch.variables?.last ?? 10
	);

	let after: string = $derived($OpenSearch.variables?.after ?? '');
	let before: string = $derived($OpenSearch.variables?.before ?? '');

	let orderField: keyof typeof OpenSearchOrderField = $derived(
		$OpenSearch.variables?.orderBy?.field ?? OpenSearchOrderField.NAME
	);

	let orderDirection: keyof typeof OrderDirection = $derived(
		$OpenSearch.variables?.orderBy?.direction ?? OrderDirection.ASC
	);

	const handleSortDirection = (key: string) => {
		changeQuery({ direction: key as OrderDirection$options });
	};

	const handleSortField = (key: string) => {
		changeQuery({
			field: key as keyof typeof OpenSearchOrderField
		});
	};

	const handleNumberOfRows = (value: number) => {
		changeQuery({ newRows: value, resetPagination: true });
	};

	const changeQuery = (
		params: {
			field?: OpenSearchOrderField$options;
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

<GraphErrors errors={$OpenSearch.errors} />

{#if $OpenSearch.data}
	{@const cost = $OpenSearch.data.team.cost}
	{@const instances = $OpenSearch.data.team.openSearchInstances}
	<div class="header">
		<IconWithText text="OpenSearch instances" icon={OpenSearchIcon} size="large" />
	</div>
	{#if instances.nodes.length > 0 || $OpenSearch.data.team.totalCount.pageInfo.totalCount > 0}
		<div class="content-wrapper">
			<div>
				<BodyLong spacing>
					OpenSearch is a distributed search and analytics engine.
					<a href="https://docs.nais.io/persistence/opensearch/"
						>Learn more about OpenSearch and how to get started.</a
					>
				</BodyLong>
				<!--div class="summary-grid">
			<Card columns={3}>
				<SummaryCard
					title="Cost"
					helpText="Total OpenSearch cost for the last 30 days"
					color="green"
				>
					{#snippet icon({ color })}
						<WalletIcon height="32px" width="32px" {color} />
					{/snippet}
					<Cost cost={cost.daily.sum} />
				</SummaryCard>
			</Card>
		</div-->
				<!--Card columns={12}-->
				<div class="list">
					<div class="list-header">
						<div class="count">
							<BodyShort size="small" style="font-weight: bold;">
								{instances.pageInfo.totalCount} entries
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
												value={OpenSearchOrderField.NAME}
												onselect={(value) => {
													handleSortField(value as string);
												}}>Name</ActionMenuRadioItem
											>

											<ActionMenuRadioItem
												value={OpenSearchOrderField.ENVIRONMENT}
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
					{#each instances.nodes as instance (instance.id)}
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
				<Pagination
					page={instances.pageInfo}
					loaders={{
						loadPreviousPage: () => {
							changeQuery({ after: '', before: instances.pageInfo.startCursor ?? '' });
						},
						loadNextPage: () => {
							changeQuery({ before: '', after: instances.pageInfo.endCursor ?? '' });
						}
					}}
				/>
			</div>
			<div>
				<PersistenceCost
					title="OpenSearch cost"
					costData={cost}
					from={$OpenSearch.variables?.from ?? new Date()}
					to={$OpenSearch.variables?.to ?? new Date()}
					teamSlug={$OpenSearch.data?.team.slug}
				/>
			</div>
			<!--/Card-->
		</div>
	{:else}
		<BodyLong
			><strong>No OpenSearch found.</strong> OpenSearch is a distributed search and analytics
			engine.
			<a href="https://docs.nais.io/persistence/opensearch/"
				>Learn more about OpenSearch and how to get started.</a
			>
		</BodyLong>
	{/if}
{/if}

<style>
	.content-wrapper {
		display: grid;
		gap: var(--a-spacing-6);
		grid-template-columns: 1fr 300px;
	}
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
</style>
