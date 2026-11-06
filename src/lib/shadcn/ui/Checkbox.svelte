<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ChangeEventHandler, HTMLInputAttributes } from 'svelte/elements';
	import { GetCheckboxGroupContext } from './CheckboxGroup.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		value?: string;
		error?: boolean;
		hideLabel?: boolean;
		indeterminate?: boolean;
		description?: Snippet | string;
		size?: 'medium' | 'small';
		disabled?: boolean;
		id?: string;
		checked?: boolean;
		children: Snippet;
		readonly?: boolean;
		onchange?: ChangeEventHandler<HTMLInputElement>;
		[key: string]: unknown;
	}

	const uid = $props.id();

	let {
		value,
		hideLabel = false,
		indeterminate = false,
		description,
		size,
		disabled = false,
		id = `cb-${uid}`,
		checked = $bindable(undefined),
		children,
		readonly = false,
		onchange,
		class: className = '',
		...rest
	}: Props = $props();

	const ctx = GetCheckboxGroupContext();
	const descId = `cb-desc-${uid}`;

	let isChecked = $derived(
		ctx && ctx.groupControlled ? ctx.values.includes(value) : Boolean(checked)
	);
	let effectiveSize = $derived(size ?? ctx?.size ?? 'medium');
</script>

<div class={['sh-checkbox', `sh-checkbox--${effectiveSize}`, className]}>
	<div class="sh-checkbox__row">
		<input
			{...rest}
			{id}
			type="checkbox"
			class="sh-checkbox__input"
			bind:indeterminate
			checked={isChecked}
			{value}
			{disabled}
			aria-describedby={description ? descId : undefined}
			onclick={(e) => {
				if (readonly) e.preventDefault();
			}}
			onchange={(e) => {
				if (readonly) return;
				checked = e.currentTarget.checked;
				ctx?.onchange(value);
				onchange?.(e);
			}}
		/>
		<label for={id} class="sh-checkbox__label" class:sr-only={hideLabel}>
			{@render children()}
		</label>
	</div>
	{#if description}
		<div id={descId} class="sh-checkbox__description" class:sr-only={hideLabel}>
			{#if typeof description === 'string'}
				{description}
			{:else}
				{@render description()}
			{/if}
		</div>
	{/if}
</div>

<style>
	.sh-checkbox {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
	}
	.sh-checkbox__row {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}
	.sh-checkbox__input {
		appearance: none;
		width: var(--ax-space-16);
		height: var(--ax-space-16);
		margin: 0;
		border-radius: var(--ax-space-4);
		border: var(--sh-border-width) solid var(--border-strong);
		background-color: var(--card);
		display: inline-grid;
		place-content: center;
		cursor: pointer;
		flex-shrink: 0;
		transition:
			background-color 110ms ease,
			border-color 110ms ease;
	}
	.sh-checkbox__input::before {
		content: '';
		width: var(--ax-space-8);
		height: var(--ax-space-6);
		border-left: var(--ax-space-2) solid var(--primary-foreground);
		border-bottom: var(--ax-space-2) solid var(--primary-foreground);
		transform: translateY(calc(var(--ax-space-1) / -2)) rotate(-45deg) scale(0);
		transition: transform 100ms ease;
	}
	.sh-checkbox__input:checked {
		background-color: var(--primary);
		border-color: var(--primary);
	}
	.sh-checkbox__input:checked::before {
		transform: translateY(calc(var(--ax-space-1) / -2)) rotate(-45deg) scale(1);
	}
	.sh-checkbox__input:indeterminate {
		background-color: var(--primary);
		border-color: var(--primary);
	}
	.sh-checkbox__input:indeterminate::before {
		width: var(--ax-space-8);
		height: 0;
		border-left: none;
		border-bottom: var(--ax-space-2) solid var(--primary-foreground);
		transform: scale(1);
	}
	.sh-checkbox__input:focus-visible {
		outline: var(--ax-space-2) solid var(--ring);
		outline-offset: var(--ax-space-2);
	}
	.sh-checkbox__input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.sh-checkbox__label {
		font-size: var(--sh-font-size-sm);
		font-weight: var(--sh-font-weight-medium);
		color: var(--foreground);
		cursor: pointer;
	}
	.sh-checkbox--small .sh-checkbox__label {
		font-size: var(--sh-font-size-sm);
	}
	.sh-checkbox__description {
		padding-left: var(--ax-space-24);
		font-size: var(--sh-font-size-xs);
		color: var(--muted-foreground);
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
