<script lang="ts">
	import { BucketOrderField } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import PersistencePage from '$lib/components/persistence/PersistencePage.svelte';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { Buckets, viewerIsMember } = $derived(data);
</script>

<GraphErrors errors={$Buckets.errors} />

{#if $Buckets.data}
	<PersistencePage
		cdnBucket={$Buckets.data.team.externalResources.cdn?.bucket}
		{viewerIsMember}
		cost={{
			costData: $Buckets.data.team.cost,
			teamSlug: $Buckets.data.team.slug,
			pageName: 'Buckets'
		}}
		list={$Buckets.data.team.buckets.nodes}
		pageInfo={$Buckets.data.team.buckets.pageInfo}
		orderField={BucketOrderField}
		defaultOrderField={BucketOrderField.NAME}
	>
		{#snippet description()}
			<BodyLong spacing>
				Storage buckets are containers for storing and managing data in the cloud.
				<a href="https://docs.nais.io/persistence/buckets"
					>Learn more about Buckets and how to get started.</a
				>
			</BodyLong>
		{/snippet}
		{#snippet notFound()}
			<div>
				<BodyLong>
					<strong>No Buckets found.</strong> Storage buckets are containers for storing and managing
					data in the cloud.
					<a href="https://docs.nais.io/persistence/buckets">
						Learn more about Buckets and how to get started.
					</a>
				</BodyLong>
			</div>
		{/snippet}
	</PersistencePage>
{/if}
