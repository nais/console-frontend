<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { formatImageRef, parseImage } from '$lib/utils/image';
	import { BodyShort, CopyButton, Detail, Tooltip } from '@nais/ds-svelte-community';
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

	// Digests are long sha256 hashes that are unreadable in full; show a short
	// prefix/suffix and let people copy or hover for the exact value.
	const digestShort = $derived.by(() => {
		if (!digest) return null;
		const [algorithm, value] = digest.split(':');
		if (!value) return digest;
		return value.length > 16 ? `${algorithm}:${value.slice(0, 8)}…${value.slice(-6)}` : digest;
	});
</script>

{#snippet versionRows()}
	{#if tag}
		<div class="kv-row">
			<Detail as="dt">Tag</Detail>
			<BodyShort as="dd"><code>{tag}</code></BodyShort>
		</div>
	{/if}
	{#if digest && digestShort}
		<div class="kv-row">
			<Detail as="dt">Digest</Detail>
			<BodyShort as="dd">
				<span class="digest-cell">
					<Tooltip content={digest}>
						<code>{digestShort}</code>
					</Tooltip>
					<CopyButton copyText={digest} size="xsmall" variant="action" />
				</span>
			</BodyShort>
		</div>
	{/if}
{/snippet}

<SurfaceCard {title} {level} {bordered}>
	{#snippet headerAside()}
		{#if imageRef.length > 0}
			<CopyButton copyText={imageRef} size="xsmall" variant="action" />
		{/if}
	{/snippet}

	{#if imageDetails.registry === '' || imageDetails.repository === '' || imageDetails.name === ''}
		<dl class="kv">
			<div class="kv-row">
				<Detail as="dt">Name</Detail>
				<BodyShort as="dd"><code>{imageName}</code></BodyShort>
			</div>
			{@render versionRows()}
		</dl>
	{:else}
		<dl class="kv">
			<div class="kv-row">
				<Detail as="dt">Registry</Detail>
				<BodyShort as="dd"><code>{imageDetails.registry}</code></BodyShort>
			</div>
			<div class="kv-row">
				<Detail as="dt">Repository</Detail>
				<BodyShort as="dd"><code>{imageDetails.repository}</code></BodyShort>
			</div>
			<div class="kv-row">
				<Detail as="dt">Name</Detail>
				<BodyShort as="dd"><code>{imageDetails.name}</code></BodyShort>
			</div>
			{@render versionRows()}
		</dl>
	{/if}

	{#if children}
		{@render children()}
	{/if}
</SurfaceCard>

<style>
	.kv {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
		margin: 0;
		min-width: 0;
	}

	.kv-row {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
		min-width: 0;
	}

	.kv-row :global(dd) {
		margin: 0;
		min-width: 0;
	}

	.digest-cell {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	code {
		font-size: var(--ax-font-size-small);
		font-family: monospace;
		overflow-wrap: anywhere;
		word-break: break-word;
	}
</style>
