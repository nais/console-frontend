<script lang="ts" module>
	import { getContext, hasContext } from 'svelte';

	export interface AccordionContext {
		readonly size: 'large' | 'medium' | 'small';
		readonly mounted: boolean;
	}

	const contextKey = Symbol('AccordionContext');

	export function GetAccordionContext(): AccordionContext | undefined {
		if (!hasContext(contextKey)) return undefined;
		return getContext<AccordionContext>(contextKey);
	}
</script>

<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		size?: 'large' | 'medium' | 'small';
		indent?: boolean;
		as?: 'div' | 'section';
		children: Snippet;
		[key: string]: unknown;
	}

	let { size = 'medium', as = 'div', class: className = '', children, ...rest }: Props = $props();

	const ctx: AccordionContext = {
		get size() {
			return size;
		},
		mounted: true
	};

	setContext(contextKey, ctx);
</script>

<svelte:element this={as} class={['sh-accordion', className]} {...rest}>
	{@render children()}
</svelte:element>

<style>
	.sh-accordion {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--border);
	}
</style>
