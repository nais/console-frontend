<script lang="ts">
	import { page } from '$app/state';
	import { KafkaTopicOrderField, OrderDirection } from '$houdini';
	import { docURL } from '$lib/doc';
	import PersistenceCost from '$lib/domain/cost/PersistenceCost.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import KafkaIcon from '$lib/icons/KafkaIcon.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Tag } from '@nais/ds-svelte-community';
	import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
	import type { PageProps } from './$types';

	type KafkaTopicOrderFieldOptions =
		(typeof KafkaTopicOrderField)[keyof typeof KafkaTopicOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();
	let { KafkaTopics } = $derived(data);

	const sortFields: { value: KafkaTopicOrderFieldOptions; label: string }[] = [
		{ value: KafkaTopicOrderField.NAME, label: 'Name' },
		{ value: KafkaTopicOrderField.ENVIRONMENT, label: 'Environment' }
	];

	const currentSortField: KafkaTopicOrderFieldOptions = $derived(
		(Object.values(KafkaTopicOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as KafkaTopicOrderFieldOptions | undefined) ?? KafkaTopicOrderField.NAME
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function setSort(field: KafkaTopicOrderFieldOptions) {
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: OrderDirection.ASC;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' });
	}

	let cost = $derived(() => {
		const costData = $KafkaTopics.data?.team.cost;
		const teamSlug = $KafkaTopics.data?.team.slug;

		if (!costData || !teamSlug) return null;

		return {
			costData,
			teamSlug,
			pageName: 'Kafka'
		};
	});
</script>

<GraphErrors errors={$KafkaTopics.errors} />

{#if $KafkaTopics.data}
	<div class="content-wrapper">
		<div>
			<List title="Kafka" count={$KafkaTopics.data.team.kafkaTopics.pageInfo.totalCount}>
				{#if $KafkaTopics.data.team.kafkaTopics.nodes.length > 0}
					{#each $KafkaTopics.data.team.kafkaTopics.nodes as instance (instance.id)}
						<ListItem interactive>
							<div class="name-group">
								<KafkaIcon style="font-size: 1.25rem; flex-shrink: 0" />
								<a
									href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
										.name}/kafka/{instance.name}"
									class="item-name">{instance.name}</a
								>
								<Tag
									size="xsmall"
									variant={envTagVariant(instance.teamEnvironment.environment.name)}
									>{instance.teamEnvironment.environment.name}</Tag
								>
							</div>
						</ListItem>
					{/each}
				{:else}
					<ListItem>
						<p>
							No Kafka topics found. Kafka topics are categories where messages are published and
							consumed, acting as distributed logs for event streaming.
							<ExternalLink href={docURL('/persistence/kafka')}
								>Learn more about Kafka and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/if}
			</List>
			<Pagination
				page={$KafkaTopics.data.team.kafkaTopics.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeParams(
							{
								after: '',
								before: $KafkaTopics.data?.team.kafkaTopics.pageInfo.startCursor ?? ''
							},
							{ noScroll: true }
						),
					loadNextPage: () =>
						changeParams(
							{ before: '', after: $KafkaTopics.data?.team.kafkaTopics.pageInfo.endCursor ?? '' },
							{ noScroll: true }
						)
				}}
			/>
		</div>
		<div class="right-column">
			<SurfaceCard title="Filters">
				<ListFilters
					{sortFields}
					{currentSortField}
					{currentSortDirection}
					onSort={(field) => setSort(field as KafkaTopicOrderFieldOptions)}
				/>
			</SurfaceCard>
			{#if cost()}
				{@const costData = cost()!}
				<SurfaceCard title="Cost">
					<PersistenceCost
						pageName={costData.pageName}
						costData={costData.costData}
						teamSlug={costData.teamSlug}
						from={startOfMonth(subMonths(new Date(), 1))}
						to={endOfYesterday()}
						service="Kafka Shared"
					/>
				</SurfaceCard>
			{/if}
		</div>
	</div>

	<style>
		.content-wrapper {
			display: grid;
			gap: var(--ax-space-24);
			grid-template-columns: 1fr 300px;
			align-items: start;
		}

		.right-column {
			display: grid;
			gap: var(--ax-space-24);
			align-content: start;
		}

		@media (max-width: 767px), (max-height: 500px) {
			.content-wrapper {
				grid-template-columns: 1fr;
			}
		}

		.name-group {
			display: flex;
			align-items: center;
			gap: var(--ax-space-8);
			min-width: 0;
		}
		.name-group :global(.aksel-tag) {
			white-space: nowrap;
			flex-shrink: 0;
		}
		.item-name {
			color: var(--ax-text-neutral);
			text-decoration: none;
			font-weight: 500;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			min-width: 0;
			flex: 0 1 auto;
		}
		.item-name:hover {
			text-decoration: underline;
		}
	</style>
{/if}
