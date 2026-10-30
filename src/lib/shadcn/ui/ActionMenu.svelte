<script lang="ts" module>
	import { getContext, hasContext } from 'svelte';

	export interface ActionMenuContext {
		close(): void;
	}

	const contextKey = Symbol('ActionMenuContext');

	export function GetActionMenuContext(): ActionMenuContext | undefined {
		if (!hasContext(contextKey)) return undefined;
		return getContext<ActionMenuContext>(contextKey);
	}
</script>

<script lang="ts">
	import { setContext, type Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		children: Snippet;
		trigger: Snippet<[{ props: Record<string, unknown> }]>;
		[key: string]: unknown;
	}

	let { open = $bindable(false), children, trigger }: Props = $props();

	const ctx: ActionMenuContext = {
		close() {
			open = false;
		}
	};

	setContext(contextKey, ctx);

	let triggerProps = $derived({
		'aria-haspopup': 'menu',
		'aria-expanded': open,
		onclick: (e: MouseEvent) => {
			e.stopPropagation();
			open = !open;
		}
	});
</script>

<svelte:window
	onclick={() => {
		if (open) open = false;
	}}
	onkeydown={(e) => {
		if (open && e.key === 'Escape') open = false;
	}}
/>

<div class="sh-action-menu">
	{@render trigger({ props: triggerProps })}
	{#if open}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			role="menu"
			tabindex="-1"
			class="sh-action-menu-content"
			onclick={(e) => e.stopPropagation()}
		>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.sh-action-menu {
		position: relative;
		display: inline-flex;
	}
	.sh-action-menu-content {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		z-index: 50;
		min-width: 11rem;
		padding: 0.25rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background-color: var(--popover);
		color: var(--popover-foreground);
		box-shadow: var(--sh-shadow-lg);
	}
</style>
