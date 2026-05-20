<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Detail } from '@nais/ds-svelte-community';

	interface Props {
		lastModifiedAt: Date | null;
		lastModifiedBy: {
			readonly name: string;
			readonly email: string;
		} | null;
	}

	let { lastModifiedAt, lastModifiedBy }: Props = $props();
</script>

<SurfaceCard title="Metadata">
	<dl class="metadata-list">
		<Detail as="dt">Last Modified</Detail>
		<BodyShort as="dd">
			{#if lastModifiedAt}
				<Time time={lastModifiedAt} distance />
			{:else}
				<code>n/a</code>
			{/if}
		</BodyShort>
		<Detail as="dt">By</Detail>
		<BodyShort as="dd">
			{#if lastModifiedBy}
				<span class="cap" title={lastModifiedBy.email}>{lastModifiedBy.name}</span>
			{:else}
				<code>n/a</code>
			{/if}
		</BodyShort>
	</dl>
</SurfaceCard>

<style>
	.metadata-list {
		margin: 0;
	}

	code {
		font-size: 1rem;
	}

	.cap {
		text-transform: capitalize;
	}
</style>
