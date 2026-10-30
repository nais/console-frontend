<script lang="ts" module>
	import { getContext, hasContext } from 'svelte';

	export interface CheckboxGroupContext {
		readonly values: unknown[];
		readonly groupControlled: boolean;
		readonly hasError: boolean;
		readonly size: 'medium' | 'small';
		onchange(value: unknown): void;
	}

	const contextKey = Symbol('CheckboxGroupContext');

	export function GetCheckboxGroupContext(): CheckboxGroupContext | undefined {
		if (!hasContext(contextKey)) return undefined;
		return getContext<CheckboxGroupContext>(contextKey);
	}
</script>

<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import ErrorMessage from './ErrorMessage.svelte';

	interface Props extends HTMLFieldsetAttributes {
		value?: unknown[];
		size?: 'medium' | 'small';
		disabled?: boolean;
		hideLegend?: boolean;
		error?: string;
		errorId?: string;
		id?: string;
		legend?: string | Snippet;
		description?: string | Snippet;
		children: Snippet;
		[key: string]: unknown;
	}

	const uid = $props.id();

	let {
		value = $bindable([]),
		size = 'medium',
		disabled = false,
		hideLegend = false,
		error = '',
		id = `cbg-${uid}`,
		legend,
		description,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const ctx: CheckboxGroupContext = {
		get values() {
			return value;
		},
		get groupControlled() {
			return value !== undefined;
		},
		get hasError() {
			return Boolean(error);
		},
		get size() {
			return size;
		},
		onchange(v: unknown) {
			if (!this.groupControlled) return;
			const idx = value.indexOf(v);
			if (idx !== -1) {
				value.splice(idx, 1);
			} else {
				value.push(v);
			}
		}
	};

	setContext(contextKey, ctx);
</script>

<fieldset {id} {disabled} class={['sh-checkbox-group', className]} {...rest}>
	{#if legend}
		<legend class="sh-checkbox-group__legend" class:sr-only={hideLegend}>
			{#if typeof legend === 'string'}
				{legend}
			{:else}
				{@render legend()}
			{/if}
		</legend>
	{/if}
	{#if description}
		<div class="sh-checkbox-group__desc" class:sr-only={hideLegend}>
			{#if typeof description === 'string'}
				{description}
			{:else}
				{@render description()}
			{/if}
		</div>
	{/if}
	<div class="sh-checkbox-group__items">
		{@render children()}
	</div>
	{#if error}
		<ErrorMessage {size} showIcon>{error}</ErrorMessage>
	{/if}
</fieldset>

<style>
	.sh-checkbox-group {
		margin: 0;
		padding: 0;
		border: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.sh-checkbox-group__legend {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--foreground);
		margin-bottom: 0.25rem;
	}
	.sh-checkbox-group__desc {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}
	.sh-checkbox-group__items {
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
