<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { formatImageRef, formatImageVersion, parseImage } from '$lib/utils/image';
	import { CopyButton } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	interface Props {
		imageName: string;
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

	const imageDetails = $derived.by(() => {
		try {
			const parsed = parseImage(imageName);

			return {
				registry: parsed.registry ?? '',
				repository: parsed.repository ?? '',
				name: parsed.name ?? ''
			};
		} catch {
			return {
				registry: '',
				repository: '',
				name: ''
			};
		}
	});
	const imageRef = $derived(imageName ? formatImageRef({ name: imageName, tag, digest }) : '');
	const versionLabel = $derived(formatImageVersion({ tag, digest }));
</script>

<SurfaceCard {title} {level} {bordered}>
	{#snippet headerAside()}
		{#if imageRef.length > 0}
			<CopyButton copyText={imageRef} size="xsmall" variant="action" />
		{/if}
	{/snippet}

	{#if imageDetails.registry === '' || imageDetails.repository === '' || imageDetails.name === ''}
		<dl class="kv">
			<div>
				<dt>Name</dt>
				<dd><code>{imageName}</code></dd>
			</div>
			<div>
				<dt>Version</dt>
				<dd><code class="tag">{versionLabel}</code></dd>
			</div>
		</dl>
	{:else}
		<dl class="kv">
			<div>
				<dt>Registry</dt>
				<dd><code>{imageDetails.registry}</code></dd>
			</div>
			<div>
				<dt>Repository</dt>
				<dd><code>{imageDetails.repository}</code></dd>
			</div>
			<div>
				<dt>Name</dt>
				<dd><code>{imageDetails.name}</code></dd>
			</div>
			<div>
				<dt>Version</dt>
				<dd><code class="tag">{versionLabel}</code></dd>
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
