<script lang="ts">
	import { RedisInstanceOrderField } from '$houdini';
	import PersistencePage from '$lib/components/persistence/PersistencePage.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Redis } = $derived(data);
</script>

<GraphErrors errors={$Redis.errors} />

{#if $Redis.data}
	<PersistencePage
		costData={$Redis.data.team.cost}
		list={$Redis.data.team.redisInstances.nodes}
		pageInfo={$Redis.data.team.redisInstances.pageInfo}
		orderField={RedisInstanceOrderField}
		defaultOrderField={RedisInstanceOrderField.NAME}
		teamSlug={$Redis.data.team.slug}
		pageName="Redis"
	>
		{#snippet description()}
			<BodyLong spacing>
				Redis is a key value database that is used for storing and querying data.
				<a href="https://docs.nais.io/persistence/redis/"
					>Learn more about Redis and how to get started.</a
				>
			</BodyLong>
		{/snippet}
		{#snippet notFound()}
			<BodyLong
				><strong>No Redis found.</strong> Redis is a key value database that is used for storing and
				querying data.
				<a href="https://docs.nais.io/persistence/redis/"
					>Learn more about Redis and how to get started.</a
				>
			</BodyLong>
		{/snippet}
	</PersistencePage>
{/if}
