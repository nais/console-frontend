<script lang="ts">
	import { CopyButton, Tooltip } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';
	import SurfaceCard from './SurfaceCard.svelte';

	interface Props {
		title: string;
		manifest: string;
		children?: Snippet;
	}

	let { title, manifest, children }: Props = $props();
</script>

<SurfaceCard {title}>
	{#if children}{@render children()}{/if}
	<pre class="manifest">{manifest}</pre>
	<Tooltip content="Copy manifest to clipboard">
		<CopyButton
			text="Copy manifest"
			activeText="Manifest copied"
			variant="action"
			copyText={manifest}
		/>
	</Tooltip>
</SurfaceCard>

<style>
	.manifest {
		display: block;
		font-size: var(--ax-font-size-small);
		white-space: pre-wrap;
		margin: 0;
	}
</style>
