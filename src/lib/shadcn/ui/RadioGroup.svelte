<script lang="ts" module>
	import { getContext, hasContext } from 'svelte';

	export interface RadioGroupContext<T = unknown> {
		readonly name: string;
		value: T | undefined;
		readonly size: 'small' | 'medium';
		onchange(value: T): void;
	}

	const contextKey = Symbol('RadioGroupContext');

	export function GetRadioGroupContext<T>(): RadioGroupContext<T> | undefined {
		if (!hasContext(contextKey)) return undefined;
		return getContext<RadioGroupContext<T>>(contextKey);
	}
</script>

<script lang="ts" generics="T = unknown">
	import { setContext, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onchange'> {
		children: Snippet;
		name?: string;
		value?: T;
		onchange?: (value: T) => void;
		legend?: string | Snippet;
		description?: string | Snippet;
		hideLegend?: boolean;
		size?: 'small' | 'medium';
		[key: string]: unknown;
	}

	const uid = $props.id();

	let {
		children,
		name,
		value = $bindable(),
		onchange,
		legend,
		description,
		hideLegend = false,
		size = 'medium',
		class: className = '',
		...rest
	}: Props = $props();

	const ctx: RadioGroupContext<T> = {
		get name() {
			return name ?? `rg-${uid}`;
		},
		get value() {
			return value;
		},
		set value(v: T | undefined) {
			value = v;
		},
		get size() {
			return size;
		},
		onchange(v: T) {
			if (value === v) return;
			value = v;
			onchange?.(v);
		}
	};

	setContext(contextKey, ctx);
</script>

<fieldset class={['sh-radio-group', className]} {...rest}>
	{#if legend}
		<legend class="sh-radio-group__legend" class:sr-only={hideLegend}>
			{#if typeof legend === 'string'}
				{legend}
			{:else}
				{@render legend()}
			{/if}
		</legend>
	{/if}
	{#if description}
		<div class="sh-radio-group__desc" class:sr-only={hideLegend}>
			{#if typeof description === 'string'}
				{description}
			{:else}
				{@render description()}
			{/if}
		</div>
	{/if}
	<div class="sh-radio-group__items">
		{@render children()}
	</div>
</fieldset>

<style>
	.sh-radio-group {
		margin: 0;
		padding: 0;
		border: none;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}
	.sh-radio-group__legend {
		font-size: var(--sh-font-size-sm);
		font-weight: var(--sh-font-weight-semibold);
		color: var(--foreground);
		margin-bottom: var(--ax-space-4);
	}
	.sh-radio-group__desc {
		font-size: var(--sh-font-size-xs);
		color: var(--muted-foreground);
	}
	.sh-radio-group__items {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-6);
	}
	.sr-only {
		position: absolute;
		width: var(--ax-space-1);
		height: var(--ax-space-1);
		padding: 0;
		margin: calc(-1 * var(--ax-space-1));
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
