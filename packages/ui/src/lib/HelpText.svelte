<script lang="ts">
	import { CircleQuestionMark as QuestionmarkCircleIcon } from '@lucide/svelte';
	import { Popover, mergeProps } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export interface HelpTextProps extends HTMLButtonAttributes {
		title?: string;
		wrapperClass?: string;
		strategy?: 'absolute' | 'fixed';
		placement?: 'top' | 'right' | 'bottom' | 'left';
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		title = 'More information',
		wrapperClass = '',
		strategy = 'absolute',
		placement = 'bottom',
		class: className = '',
		children,
		...rest
	}: HelpTextProps = $props();

	let open = $state(false);
	let triggerElement = $state<HTMLButtonElement | null>(null);
	const portalTarget = $derived(
		triggerElement?.closest('[data-dialog-content], dialog, .sh-theme-root') ?? undefined
	);
</script>

<div class={['sh-helptext-wrapper', wrapperClass]}>
	<Popover.Root bind:open>
		<Popover.Trigger bind:ref={triggerElement}>
			{#snippet child({ props })}
				<button
					{...mergeProps(props, rest)}
					type="button"
					class={['sh-helptext-btn', className]}
					{title}
					aria-label={title}
				>
					<QuestionmarkCircleIcon aria-hidden="true" />
				</button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Portal to={portalTarget}>
			<Popover.Content
				class="sh-helptext-popover"
				role="dialog"
				aria-label={title}
				side={placement}
				{strategy}
				align="start"
				sideOffset={6}
			>
				{@render children()}
			</Popover.Content>
		</Popover.Portal>
	</Popover.Root>
</div>

<style>
	.sh-helptext-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
	}
	.sh-helptext-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--nais-space-2);
		border: none;
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--muted-foreground);
		cursor: pointer;
	}
	.sh-helptext-btn:hover {
		color: var(--foreground);
	}
	.sh-helptext-btn:focus-visible {
		outline: var(--nais-space-2) solid var(--ring);
		outline-offset: var(--nais-space-2);
	}
	:global(.sh-helptext-popover) {
		z-index: 50;
		width: min(var(--sh-popover-max-width), var(--bits-popover-content-available-width));
		max-height: var(--bits-popover-content-available-height);
		overflow-y: auto;
		padding: var(--nais-space-10) var(--nais-space-12);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius);
		background-color: var(--popover);
		color: var(--popover-foreground);
		box-shadow: var(--sh-shadow-md);
		font-size: var(--sh-font-size-sm);
		line-height: 1.45;
	}
</style>
