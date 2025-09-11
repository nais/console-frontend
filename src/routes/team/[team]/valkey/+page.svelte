<script lang="ts">
	import { ValkeyOrderField } from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import PersistencePage from '$lib/components/persistence/PersistencePage.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import CreatePage from './create/+page.svelte';

	let { data }: PageProps = $props();
	let { Valkeys, viewerIsMember } = $derived(data);
</script>

<GraphErrors errors={$Valkeys.errors} />

{#if $Valkeys.data}
	<PersistencePage
		cost={{
			costData: $Valkeys.data.team.cost,
			teamSlug: $Valkeys.data.team.slug,
			pageName: 'Valkey'
		}}
		list={$Valkeys.data.team.valkeys.nodes}
		pageInfo={$Valkeys.data.team.valkeys.pageInfo}
		orderField={ValkeyOrderField}
		defaultOrderField={ValkeyOrderField.NAME}
		create={{
			buttonText: 'Create Valkey',
			url: `/team/${$Valkeys.data.team.slug}/valkey/create`,
			page: CreatePage,
			header: 'Create Valkey',
			viewerIsMember: viewerIsMember
		}}
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
		{#snippet notFound({ createButton })}
			<BodyLong as="div">
				{@render createButton()}

				<strong>No Valkey instances found.</strong> Valkey is a key value database that is used for
				storing and querying data. It is a good choice for storing data that is not relational in
				nature and often used for caching.
				<ExternalLink href={docURL('/persistence/valkey')}
					>Learn more about Valkey and how to get started.</ExternalLink
				>
			</BodyLong>
		{/snippet}
	</PersistencePage>
{/if}
