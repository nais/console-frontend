<script lang="ts">
	import { RedisInstanceOrderField } from '$houdini';
	import PersistencePage from '$lib/components/persistence/PersistencePage.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { BodyLong, BodyShort } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { Redis } = $derived(data);
</script>

<GraphErrors errors={$Redis.errors} />

{#if $Redis.data}
	<PersistencePage
		cost={{
			costData: $Redis.data.team.cost,
			teamSlug: $Redis.data.team.slug,
			pageName: 'Redis'
		}}
		list={$Redis.data.team.redisInstances.nodes}
		pageInfo={$Redis.data.team.redisInstances.pageInfo}
		orderField={RedisInstanceOrderField}
		defaultOrderField={RedisInstanceOrderField.NAME}
	>
		{#snippet description()}
			<BodyShort spacing
				><span style="font-weight: bold; color: var(--a-text-danger);"
					>Aiven Redis will be shut down on March 31, 2025.</span
				></BodyShort
			>
			<BodyLong spacing>
				Redis is a key value database that is used for storing and querying data.
				<a href={docURL('/persistence/redis')}>Learn more about Redis and how to get started.</a>
			</BodyLong>
		{/snippet}
		{#snippet notFound()}
			<BodyLong
				><strong>No Redis found.</strong> Redis is a key value database that is used for storing and
				querying data.
				<a href={docURL('/persistence/redis')}>Learn more about Redis and how to get started.</a>
			</BodyLong>
		{/snippet}
	</PersistencePage>
{/if}
