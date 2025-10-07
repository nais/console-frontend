<script lang="ts">
	import { KafkaTopicOrderField, OrderDirection } from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import PersistenceLink from '$lib/components/persistence/PersistenceLink.svelte';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Tag } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { KafkaTopics } = $derived(data);
</script>

<GraphErrors errors={$KafkaTopics.errors} />

{#if $KafkaTopics.data}
	{#if $KafkaTopics.data.team.kafkaTopics.pageInfo.totalCount}
		<div class="content-wrapper">
			<div>
				<BodyLong spacing>
					Kafka topics are categories where messages are published and consumed, acting as
					distributed logs for event streaming.

					<ExternalLink href={docURL('/persistence/kafka')}
						>Learn more about Kafka and how to get started.</ExternalLink
					>
				</BodyLong>

				<List title="{$KafkaTopics.data.team.kafkaTopics.pageInfo.totalCount} entries">
					{#snippet menu()}
						<OrderByMenu
							orderField={KafkaTopicOrderField}
							defaultOrderField={KafkaTopicOrderField.NAME}
							defaultOrderDirection={OrderDirection.DESC}
						/>
					{/snippet}
					{#each $KafkaTopics.data.team.kafkaTopics.nodes as instance (instance.id)}
						<ListItem>
							<div>
								<PersistenceLink {instance} />
								<Tag size="small" variant={envTagVariant(instance.teamEnvironment.environment.name)}
									>{instance.teamEnvironment.environment.name}</Tag
								>
							</div>
						</ListItem>
					{/each}
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
		</div>
	{:else}
		<div class="content-wrapper">
			<BodyLong>
				<strong>No Kafka topics found.</strong> Kafka topics are categories where messages are
				published and consumed, acting as distributed logs for event streaming.

				<ExternalLink href={docURL('/persistence/kafka')}
					>Learn more about Kafka and how to get started.</ExternalLink
				>
			</BodyLong>
		</div>
	{/if}

	<style>
		.content-wrapper {
			display: grid;
			gap: var(--ax-space-24);
			grid-template-columns: 1fr 300px;
		}
	</style>
{/if}
