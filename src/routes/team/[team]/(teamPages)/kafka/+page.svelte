<script lang="ts">
	import Card from '$lib/Card.svelte';

	import {
		KafkaTopicOrderField,
		OrderDirection,
		type KafkaTopicOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import PersistenceLink from '$lib/components/PersistenceLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import KafkaIcon from '$lib/icons/KafkaIcon.svelte';
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

	let { KafkaTopics } = $derived(data);

	let rows: number = $derived.by(
		() => $KafkaTopics.variables?.first ?? $KafkaTopics.variables?.last ?? 10
	);

	let after: string = $derived($KafkaTopics.variables?.after ?? '');
	let before: string = $derived($KafkaTopics.variables?.before ?? '');

	let orderField: keyof typeof KafkaTopicOrderField = $derived(
		$KafkaTopics.variables?.orderBy?.field ?? KafkaTopicOrderField.NAME
	);

	let orderDirection: keyof typeof OrderDirection = $derived(
		$KafkaTopics.variables?.orderBy?.direction ?? OrderDirection.ASC
	);

	const handleSortDirection = (key: string) => {
		changeQuery({ direction: key as OrderDirection$options });
	};

	const handleSortField = (key: string) => {
		changeQuery({
			field: key as keyof typeof KafkaTopicOrderField
		});
	};

	const handleNumberOfRows = (value: number) => {
		changeQuery({ newRows: value, resetPagination: true });
	};

	const changeQuery = (
		params: {
			field?: KafkaTopicOrderField$options;
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

<GraphErrors errors={$KafkaTopics.errors} />

{#if $KafkaTopics.data}
	{@const topics = $KafkaTopics.data.team.kafkaTopics}
	<div class="header">
		<div class="heading">
			<KafkaIcon size="32px" />
			<h3>Kafka topics</h3>
		</div>
	</div>
	<BodyLong style="margin-bottom: 1rem;">
		Kafka topics are categories where messages are published and consumed, acting as distributed
		logs for event streaming.

		<a href="https://docs.nais.io/persistence/kafka"
			>Learn more about Kafka and how to get started.</a
		>
	</BodyLong>
	<Card columns={12}>
		{#if topics.nodes.length > 0 || $KafkaTopics.data.team.totalCount.pageInfo.totalCount > 0}
			<div class="list">
				<div class="list-header">
					<div class="count">
						<BodyShort size="small" style="font-weight: bold;">
							{topics.pageInfo.totalCount} entries
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
											value={KafkaTopicOrderField.NAME}
											onselect={(value) => {
												handleSortField(value as string);
											}}>Name</ActionMenuRadioItem
										>

										<ActionMenuRadioItem
											value={KafkaTopicOrderField.ENVIRONMENT}
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
				{#each topics.nodes as instance}
					<div class="list-item">
						<div class="link-wrapper">
							<div class="link">
								<PersistenceLink {instance} />
								<Detail>{instance.environment.name}</Detail>
							</div>
						</div>
					</div>
				{/each}
			</div>
			{#if topics.pageInfo.hasPreviousPage || topics.pageInfo.hasNextPage}
				<Pagination
					page={topics.pageInfo}
					loaders={{
						loadPreviousPage: () => KafkaTopics.loadPreviousPage(),
						loadNextPage: () => KafkaTopics.loadNextPage()
					}}
				/>
			{/if}
		{:else}
			<BodyLong
				><strong>No Kafka topics found.</strong> Kafka topics are categories where messages are
				published and consumed, acting as distributed logs for event streaming.

				<a href="https://docs.nais.io/persistence/kafka"
					>Learn more about Kafka and how to get started.</a
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
		}
	}
</style>
