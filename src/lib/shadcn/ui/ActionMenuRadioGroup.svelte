<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		label?: string;
		onvaluechange?: (value: string) => void;
		children: Snippet;
		[key: string]: unknown;
	}

	let { value = $bindable(''), label, onvaluechange, children, ...rest }: Props = $props();
</script>

<DropdownMenu.RadioGroup
	{...rest}
	bind:value
	onValueChange={onvaluechange}
	class="sh-action-menu-radiogroup"
>
	{#if label}
		<DropdownMenu.GroupHeading class="sh-action-menu-group-label">
			{label}
		</DropdownMenu.GroupHeading>
	{/if}
	{@render children()}
</DropdownMenu.RadioGroup>

<style>
	:global(.sh-action-menu-group-label) {
		padding: var(--nais-space-4) var(--nais-space-10);
		font-size: var(--sh-font-size-caption);
		font-weight: var(--sh-font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted-foreground);
	}
</style>
