<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Detail, Heading } from '@nais/ds-svelte-community';

	interface Props {
		lastModifiedAt: Date | string | null | undefined;
		lastModifiedBy:
			| {
					readonly name: string;
					readonly email: string;
			  }
			| null
			| undefined;
	}

	let { lastModifiedAt, lastModifiedBy }: Props = $props();
</script>

<div>
	<Heading as="h2" size="medium" spacing>Metadata</Heading>
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
</div>

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
