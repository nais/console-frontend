<script lang="ts" module>
	import { getContext, hasContext } from 'svelte';

	export interface ActionMenuRadioContext {
		readonly value: unknown;
		select(val: unknown): void;
	}

	const contextKey = Symbol('ActionMenuRadioContext');

	export function GetActionMenuRadioContext(): ActionMenuRadioContext | undefined {
		if (!hasContext(contextKey)) return undefined;
		return getContext<ActionMenuRadioContext>(contextKey);
	}
</script>

<script lang="ts">
	import { setContext, type Snippet } from 'svelte';

	interface Props {
		value?: unknown;
		label?: string;
		onvaluechange?: (value: unknown) => void;
		children: Snippet;
		[key: string]: unknown;
	}

	let { value = $bindable(), label, onvaluechange, children }: Props = $props();

	const ctx: ActionMenuRadioContext = {
		get value() {
			return value;
		},
		select(next: unknown) {
			value = next;
			onvaluechange?.(next);
		}
	};

	setContext(contextKey, ctx);
</script>

<div role="group" aria-label={label} class="sh-action-menu-radiogroup">
	{#if label}
		<div class="sh-action-menu-group-label">{label}</div>
	{/if}
	{@render children()}
</div>

<style>
	.sh-action-menu-group-label {
		padding: 0.25rem 0.625rem;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted-foreground);
	}
</style>
