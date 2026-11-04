<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let { label, children, ...rest }: Props = $props();
</script>

<DropdownMenu.Group {...rest}>
	{#if label}
		<DropdownMenu.GroupHeading class="sh-action-menu-group-heading">
			{label}
		</DropdownMenu.GroupHeading>
	{/if}
	{@render children()}
</DropdownMenu.Group>

<style>
	:global(.sh-action-menu-group-heading) {
		padding: var(--ax-space-4) var(--ax-space-10);
		font-size: var(--sh-font-size-caption);
		font-weight: var(--sh-font-weight-semibold);
		text-transform: uppercase;
		color: var(--muted-foreground);
	}
</style>
