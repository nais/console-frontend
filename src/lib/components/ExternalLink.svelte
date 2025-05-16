<script lang="ts">
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import type { Snippet } from 'svelte';

	const { children, href }: { children: Snippet; href: string } = $props();
</script>

<a {href} target="_blank" rel="noopener noreferrer" style:display="inline">
	{@render children()}
</a><ExternalLinkIcon class="text-aligned-icon" />
