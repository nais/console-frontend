<script lang="ts">
	import { KafkaTopicOrderField, OrderDirection } from '$houdini';
	import { docURL } from '$lib/doc';
	import PersistenceCost from '$lib/domain/cost/PersistenceCost.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import KafkaIcon from '$lib/icons/KafkaIcon.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Tag } from '@nais/ds-svelte-community';
	import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { KafkaTopics } = $derived(data);

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
				{#snippet menu()}
					<OrderByMenu
						orderField={KafkaTopicOrderField}
						defaultOrderField={KafkaTopicOrderField.NAME}
						defaultOrderDirection={OrderDirection.DESC}
					/>
				{/snippet}
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
