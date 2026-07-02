<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { formatImageRef, parseImage } from '$lib/utils/image';
	import { CopyButton } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	interface Props {
		imageName?: string;
		tag?: string;
		digest?: string | null;
		title?: string;
		bordered?: boolean;
		level?: 'h2' | 'h3' | 'h4';
		children?: Snippet;
	}

	let {
		imageName,
		tag,
		digest,
		title = 'Image',
		bordered = true,
		level = 'h3',
		children
	}: Props = $props();

	const { registry, repository, name } = $derived(parseImage(imageName));
	const imageRef = $derived(imageName ? formatImageRef({ name: imageName, tag, digest }) : '');
	const copyableImageRef = $derived(imageRef.trim());
</script>

<SurfaceCard {title} {level} {bordered}>
	{#snippet headerAside()}
		{#if copyableImageRef.length > 0}
			<CopyButton copyText={copyableImageRef} size="xsmall" variant="action" />
		{/if}
	{/snippet}

	{#if registry === '' || repository === '' || name === ''}
		<dl class="kv">
			<div>
				<dt>Name</dt>
				<dd><code>{imageName}</code></dd>
			</div>
			<div>
				<dt>Tag</dt>
				<dd><code class="tag">{tag || digest || '-'}</code></dd>
			</div>
		</dl>
	{:else}
		<dl class="kv">
			<div>
				<dt>Registry</dt>
				<dd><code>{registry}</code></dd>
			</div>
			<div>
				<dt>Repository</dt>
				<dd><code>{repository}</code></dd>
			</div>
			<div>
				<dt>Name</dt>
				<dd><code>{name}</code></dd>
			</div>
			<div>
				<dt>Tag</dt>
				<dd><code class="tag">{tag || digest || '-'}</code></dd>
			</div>
		</dl>
	{/if}

	{#if children}
		{@render children()}
	{/if}
</SurfaceCard>

<style>
	.kv {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-4) var(--ax-space-12);
		align-items: baseline;
	}

	.kv > div {
		display: contents;
	}

	.kv dt {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-neutral-subtle);
	}

	.kv dd {
		margin: 0;
		color: var(--ax-text-neutral);
	}

	code {
		font-size: var(--ax-font-size-small);
		font-family: monospace;
	}

	.tag {
		word-break: break-all;
	}
</style>
