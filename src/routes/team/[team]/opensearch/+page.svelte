<script lang="ts">
	import { OpenSearchOrderField } from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import PersistencePage from '$lib/components/persistence/PersistencePage.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import CreatePage from '../opensearch/create/+page.svelte';

	let { data }: PageProps = $props();
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
		list={$OpenSearch.data.team.openSearches.nodes}
		pageInfo={$OpenSearch.data.team.openSearches.pageInfo}
		orderField={OpenSearchOrderField}
		defaultOrderField={OpenSearchOrderField.NAME}
		create={{
			buttonText: 'Create OpenSearch',
			url: `/team/${$OpenSearch.data.team.slug}/opensearch/create`,
			page: CreatePage,
			header: 'Create OpenSearch'
		}}
	>
		{#snippet description()}
			<BodyLong spacing>
				OpenSearch is a distributed search and analytics engine.
				<ExternalLink href={docURL('/persistence/opensearch')}
					>Learn more about OpenSearch and how to get started.</ExternalLink
				>
			</BodyLong>
		{/snippet}
		{#snippet notFound()}
			<BodyLong
				><strong>No OpenSearch found.</strong> OpenSearch is a distributed search and analytics
				engine.
				<ExternalLink href={docURL('/persistence/opensearch')}
					>Learn more about OpenSearch and how to get started.</ExternalLink
				>
			</BodyLong>
		{/snippet}
	</PersistencePage>
{/if}
