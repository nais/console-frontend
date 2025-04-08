<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { Heading } from '@nais/ds-svelte-community';

	interface Props {
		lastModifiedAt: Date | null;
		lastModifiedBy: {
			readonly name: string;
			readonly email: string;
		} | null;
	}

	let { lastModifiedAt, lastModifiedBy }: Props = $props();
</script>

<div class="card">
	<Heading level="2" size="medium" spacing>Metadata</Heading>
	<Heading level="3" size="xsmall">Last Modified</Heading>
	<div class="value">
		{#if lastModifiedAt}
			<Time time={lastModifiedAt} distance />
		{:else}
			<code>n/a</code>
		{/if}
	</div>
	<Heading level="3" size="xsmall">Last Modified by</Heading>
	<div class="value">
		Last modified by
		{#if lastModifiedBy}
			<span class="cap" title={lastModifiedBy.email}>{lastModifiedBy.name}</span>
		{:else}
			<code>n/a</code>
		{/if}
	</div>
</div>

<style>
	.card {
		background-color: var(--ax-bg-sunken, --a-surface-subtle);
		padding: var(--ax-space-20, --a-spacing-5) var(--ax-space-20, --a-spacing-5);
		border-radius: 12px;
	}
	code {
		font-size: 1rem;
	}

	.value {
		margin-left: 1rem;
	}

	.cap {
		text-transform: capitalize;
	}
</style>
