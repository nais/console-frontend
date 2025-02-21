<script lang="ts">
	import { BigQueryDatasetOrderField } from '$houdini';
	import PersistencePage from '$lib/components/persistence/PersistencePage.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { BigQuery } = $derived(data);
</script>

<GraphErrors errors={$BigQuery.errors} />

{#if $BigQuery.data}
	<PersistencePage
		cost={{
			costData: $BigQuery.data.team.cost,
			teamSlug: $BigQuery.data.team.slug,
			pageName: 'BigQuery'
		}}
		list={$BigQuery.data.team.bigQueryDatasets.nodes}
		pageInfo={$BigQuery.data.team.bigQueryDatasets.pageInfo}
		orderField={BigQueryDatasetOrderField}
		defaultOrderField={BigQueryDatasetOrderField.NAME}
	>
		{#snippet description()}
			<BodyLong spacing>
				BigQuery datasets store structured data optimized for analytical workloads.
				<a href="https://docs.nais.io/persistence/bigquery"
					>Learn more about BigQuery datasets and how to get started.</a
				>
			</BodyLong>
		{/snippet}
		{#snippet notFound()}
			<BodyLong
				><strong>No BigQuery datasets found.</strong> BigQuery datasets store structured data
				optimized for analytical workloads.
				<a href="https://docs.nais.io/persistence/bigquery"
					>Learn more about BigQuery datasets and how to get started.</a
				>
			</BodyLong>
		{/snippet}
	</PersistencePage>
{/if}
