<script lang="ts">
	import { Popover } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		label: string;
		trigger: Snippet<[Record<string, unknown>]>;
		children: Snippet;
	}

	let { open = $bindable(false), label, trigger, children }: Props = $props();
	let triggerElement = $state<HTMLElement | null>(null);
	const portalTarget = $derived(
		triggerElement?.closest('[data-dialog-content], dialog, .sh-theme-root') ?? undefined
	);
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerElement}>
		{#snippet child({ props })}
			{@render trigger(props)}
		{/snippet}
	</Popover.Trigger>
	<Popover.Portal to={portalTarget}>
		<Popover.Content
			class="sh-popover-content"
			role="dialog"
			aria-label={label}
			side="bottom"
			align="end"
			sideOffset={6}
		>
			{@render children()}
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>

<style>
	:global(.sh-popover-content) {
		z-index: 50;
		max-width: min(
			var(--sh-popover-max-width),
			var(--bits-popover-content-available-width),
			calc(100vw - var(--nais-space-24))
		);
		max-height: var(--bits-popover-content-available-height);
		overflow-y: auto;
		padding: var(--nais-space-16);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius);
		background-color: var(--popover);
		color: var(--popover-foreground);
		box-shadow: var(--sh-shadow-lg);
	}
</style>
