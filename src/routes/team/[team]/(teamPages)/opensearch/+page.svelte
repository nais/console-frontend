<script lang="ts">
	import { OpenSearchOrderField } from '$houdini';
	import PersistencePage from '$lib/components/persistence/PersistencePage.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { OpenSearch } = $derived(data);
</script>

<GraphErrors errors={$OpenSearch.errors} />

{#if $OpenSearch.data}
	<PersistencePage
		cost={{
			costData: $OpenSearch.data.team.cost,
			teamSlug: $OpenSearch.data.team.slug,
			pageName: 'OpenSearch'
		}}
		list={$OpenSearch.data.team.openSearchInstances.nodes}
		pageInfo={$OpenSearch.data.team.openSearchInstances.pageInfo}
		orderField={OpenSearchOrderField}
		defaultOrderField={OpenSearchOrderField.NAME}
	>
		{#snippet description()}
			<BodyLong spacing>
				OpenSearch is a distributed search and analytics engine.
				<a href="https://docs.nais.io/persistence/opensearch/"
					>Learn more about OpenSearch and how to get started.</a
				>
			</BodyLong>
		{/snippet}
		{#snippet notFound()}
			<BodyLong
				><strong>No OpenSearch found.</strong> OpenSearch is a distributed search and analytics
				engine.
				<a href="https://docs.nais.io/persistence/opensearch/"
					>Learn more about OpenSearch and how to get started.</a
				>
			</BodyLong>
		{/snippet}
	</PersistencePage>
{/if}
