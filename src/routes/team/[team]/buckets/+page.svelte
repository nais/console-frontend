<script lang="ts">
	import { BucketOrderField } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import PersistencePage from '$lib/components/persistence/PersistencePage.svelte';
	import { docURL } from '$lib/doc';
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
				<ExternalLink href={docURL('/persistence/buckets')}
					>Learn more about Buckets and how to get started.</ExternalLink
				>
			</BodyLong>
		{/snippet}
		{#snippet notFound()}
			<div>
				<BodyLong>
					<strong>No Buckets found.</strong> Storage buckets are containers for storing and managing
					data in the cloud.
					<ExternalLink href={docURL('/persistence/buckets')}>
						Learn more about Buckets and how to get started.
					</ExternalLink>
				</BodyLong>
			</div>
		{/snippet}
	</PersistencePage>
{/if}
