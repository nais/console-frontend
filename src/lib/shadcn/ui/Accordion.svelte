<script lang="ts" module>
	import { createContext } from 'svelte';

	export interface AccordionContext {
		readonly size: 'large' | 'medium' | 'small';
		readonly mounted: boolean;
	}

	const [getAccordionContext, setAccordionContext, hasAccordionContext] =
		createContext<AccordionContext>();

	export function GetAccordionContext(): AccordionContext | undefined {
		return hasAccordionContext() ? getAccordionContext() : undefined;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
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

	setAccordionContext(ctx);
</script>

<svelte:element this={as} class={['sh-accordion', className]} {...rest}>
	{@render children()}
</svelte:element>

<style>
	.sh-accordion {
		display: flex;
		flex-direction: column;
		border-top: var(--sh-border-width) solid var(--border);
	}
</style>
