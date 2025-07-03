<script lang="ts">
	import { ValkeyInstanceOrderField } from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import PersistencePage from '$lib/components/persistence/PersistencePage.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Valkey } = $derived(data);
</script>

<GraphErrors errors={$Valkey.errors} />

{#if $Valkey.data}
	<PersistencePage
		cost={{
			costData: $Valkey.data.team.cost,
			teamSlug: $Valkey.data.team.slug,
			pageName: 'Valkey'
		}}
		list={$Valkey.data.team.valkeyInstances.nodes}
		pageInfo={$Valkey.data.team.valkeyInstances.pageInfo}
		orderField={ValkeyInstanceOrderField}
		defaultOrderField={ValkeyInstanceOrderField.NAME}
	>
		{#snippet description()}
			<BodyLong spacing>
				Valkey is a key value database that is used for storing and querying data. It is a good
				choice for storing data that is not relational in nature and often used for caching.
				<ExternalLink href={docURL('/persistence/valkey')}
					>Learn more about Valkey and how to get started.</ExternalLink
				>
			</BodyLong>
		{/snippet}
		{#snippet notFound()}
			<BodyLong
				><strong>No Valkey instances found.</strong> Valkey is a key value database that is used for
				storing and querying data. It is a good choice for storing data that is not relational in
				nature and often used for caching.
				<ExternalLink href={docURL('/persistence/valkey')}
					>Learn more about Valkey and how to get started.</ExternalLink
				>
			</BodyLong>
		{/snippet}
	</PersistencePage>
{/if}
