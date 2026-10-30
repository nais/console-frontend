<script lang="ts">
	import { ExternalLinkIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';

	const { children, href }: { children: Snippet; href: string } = $props();
</script>

<span
	><a {href} target="_blank" rel="noopener noreferrer" style:display="inline">
		{@render children()}
	</a>
	<ExternalLinkIcon class="text-aligned-icon" /></span
>
