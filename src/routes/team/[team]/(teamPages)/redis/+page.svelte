<script lang="ts">
	import {
		OrderDirection,
		RedisInstanceOrderField,
		type OrderDirection$options,
		type RedisInstanceOrderField$options
	} from '$houdini';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import PersistenceCost from '$lib/components/PersistenceCost.svelte';
	import PersistenceLink from '$lib/components/PersistenceLink.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import RedisIcon from '$lib/icons/RedisIcon.svelte';
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

	let { Redis } = $derived(data);

	let rows: number = $derived.by(() => $Redis.variables?.first ?? $Redis.variables?.last ?? 10);

	let after: string = $derived($Redis.variables?.after ?? '');
	let before: string = $derived($Redis.variables?.before ?? '');

	let orderField: keyof typeof RedisInstanceOrderField = $derived(
		$Redis.variables?.orderBy?.field ?? RedisInstanceOrderField.NAME
	);

	let orderDirection: keyof typeof OrderDirection = $derived(
		$Redis.variables?.orderBy?.direction ?? OrderDirection.ASC
	);

	const handleSortDirection = (key: string) => {
		changeQuery({ direction: key as OrderDirection$options });
	};

	const handleSortField = (key: string) => {
		changeQuery({
			field: key as keyof typeof RedisInstanceOrderField
		});
	};

	const handleNumberOfRows = (value: number) => {
		changeQuery({ newRows: value, resetPagination: true });
	};

	const changeQuery = (
		params: {
			field?: RedisInstanceOrderField$options;
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

<GraphErrors errors={$Redis.errors} />

{#if $Redis.data}
	{@const cost = $Redis.data.team.cost}
	{@const instances = $Redis.data.team.redisInstances}
	<div class="header">
		<IconWithText text="Redis instances" icon={RedisIcon} size="large" />
	</div>
	{#if instances.nodes.length > 0 || $Redis.data.team.totalCount.pageInfo.totalCount > 0}
		<div class="content-wrapper">
			<div>
				<BodyLong spacing>
					Redis is a key value database that is used for storing and querying data.
					<a href="https://docs.nais.io/persistence/redis/"
						>Learn more about Redis and how to get started.</a
					>
				</BodyLong>

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
												value={RedisInstanceOrderField.NAME}
												onselect={(value) => {
													handleSortField(value as string);
												}}>Name</ActionMenuRadioItem
											>

											<ActionMenuRadioItem
												value={RedisInstanceOrderField.ENVIRONMENT}
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
				{#if instances.pageInfo.hasPreviousPage || instances.pageInfo.hasNextPage}
					<Pagination
						page={instances.pageInfo}
						loaders={{
							loadPreviousPage: () => {
								changeQuery({ before: instances.pageInfo.startCursor ?? '' });
								Redis.loadPreviousPage({ last: rows });
							},
							loadNextPage: () => {
								changeQuery({ after: instances.pageInfo.endCursor ?? '' });
								Redis.loadNextPage({ first: rows });
							}
						}}
					/>
				{/if}
			</div>
			<div>
				<PersistenceCost
					title="Redis cost"
					costData={cost}
					from={$Redis.variables?.from ?? new Date()}
					to={$Redis.variables?.to ?? new Date()}
					teamSlug={$Redis.data?.team.slug}
				/>
			</div>
		</div>
	{:else}
		<BodyLong
			><strong>No Redis found.</strong> Redis is a key value database that is used for storing and
			querying data.
			<a href="https://docs.nais.io/persistence/redis/"
				>Learn more about Redis and how to get started.</a
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
