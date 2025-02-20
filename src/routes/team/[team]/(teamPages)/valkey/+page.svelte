<script lang="ts">
	import { ValkeyInstanceOrderField } from '$houdini';
	import PersistencePage from '$lib/components/PersistencePage.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Valkey } = $derived(data);
</script>

<GraphErrors errors={$Valkey.errors} />

{#if $Valkey.data}
	<PersistencePage
		costData={$Valkey.data.team.cost}
		list={$Valkey.data.team.valkeyInstances.nodes}
		pageInfo={$Valkey.data.team.valkeyInstances.pageInfo}
		orderField={ValkeyInstanceOrderField}
		defaultOrderField={ValkeyInstanceOrderField.NAME}
		teamSlug={$Valkey.data.team.slug}
		pageName="Valkey"
	>
		{#snippet description()}
			<BodyLong spacing>
				Valkey is a key value database that is used for storing and querying data. It is a good
				choice for storing data that is not relational in nature and often used for caching.
				<a href="https://docs.nais.io/persistence/valkey"
					>Learn more about Valkey and how to get started.</a
				>
			</BodyLong>
		{/snippet}
		{#snippet notFound()}
			<BodyLong
				><strong>No Valkey instances found.</strong> Valkey is a key value database that is used for
				storing and querying data. It is a good choice for storing data that is not relational in
				nature and often used for caching.
				<a href="https://docs.nais.io/persistence/valkey"
					>Learn more about Valkey and how to get started.</a
				>
			</BodyLong>
		{/snippet}
	</PersistencePage>
{/if}
