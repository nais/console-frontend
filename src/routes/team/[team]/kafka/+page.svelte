<script lang="ts">
	import { KafkaTopicOrderField } from '$houdini';
	import PersistencePage from '$lib/components/persistence/PersistencePage.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';

	let { data }: PageProps = $props();
	let { KafkaTopics } = $derived(data);
</script>

<GraphErrors errors={$KafkaTopics.errors} />

{#if $KafkaTopics.data}
	<PersistencePage
		list={$KafkaTopics.data.team.kafkaTopics.nodes}
		pageInfo={$KafkaTopics.data.team.kafkaTopics.pageInfo}
		orderField={KafkaTopicOrderField}
		defaultOrderField={KafkaTopicOrderField.NAME}
	>
		{#snippet description()}
			<BodyLong spacing>
				Kafka topics are categories where messages are published and consumed, acting as distributed
				logs for event streaming.

				<ExternalLink href={docURL('/persistence/kafka')}
					>Learn more about Kafka and how to get started.</ExternalLink
				>
			</BodyLong>
		{/snippet}
		{#snippet notFound()}
			<BodyLong
				><strong>No Kafka topics found.</strong> Kafka topics are categories where messages are
				published and consumed, acting as distributed logs for event streaming.

				<ExternalLink href={docURL('/persistence/kafka')}
					>Learn more about Kafka and how to get started.</ExternalLink
				>
			</BodyLong>
		{/snippet}
	</PersistencePage>
{/if}
