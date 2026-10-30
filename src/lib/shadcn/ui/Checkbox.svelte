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
		gap: 0.15rem;
	}
	.sh-checkbox__row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.sh-checkbox__input {
		appearance: none;
		width: 1rem;
		height: 1rem;
		margin: 0;
		border-radius: 0.25rem;
		border: 1px solid var(--border-strong);
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
		width: 0.55rem;
		height: 0.32rem;
		border-left: 1.75px solid var(--primary-foreground);
		border-bottom: 1.75px solid var(--primary-foreground);
		transform: translateY(-0.5px) rotate(-45deg) scale(0);
		transition: transform 100ms ease;
	}
	.sh-checkbox__input:checked {
		background-color: var(--primary);
		border-color: var(--primary);
	}
	.sh-checkbox__input:checked::before {
		transform: translateY(-0.5px) rotate(-45deg) scale(1);
	}
	.sh-checkbox__input:indeterminate {
		background-color: var(--primary);
		border-color: var(--primary);
	}
	.sh-checkbox__input:indeterminate::before {
		width: 0.5rem;
		height: 0;
		border-left: none;
		border-bottom: 2px solid var(--primary-foreground);
		transform: scale(1);
	}
	.sh-checkbox__input:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}
	.sh-checkbox__input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.sh-checkbox__label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--foreground);
		cursor: pointer;
	}
	.sh-checkbox--small .sh-checkbox__label {
		font-size: 0.8125rem;
	}
	.sh-checkbox__description {
		padding-left: 1.5rem;
		font-size: 0.75rem;
		color: var(--muted-foreground);
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
