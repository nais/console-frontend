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
		gap: 0.5rem;
	}
	.sh-radio-group__legend {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--foreground);
		margin-bottom: 0.25rem;
	}
	.sh-radio-group__desc {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}
	.sh-radio-group__items {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
