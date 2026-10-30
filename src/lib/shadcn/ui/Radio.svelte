<script lang="ts" generics="T = unknown">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { GetRadioGroupContext } from './RadioGroup.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'size' | 'value'> {
		children: Snippet;
		value: T;
		description?: Snippet | string;
		size?: 'medium' | 'small';
		[key: string]: unknown;
	}

	const uid = $props.id();

	let {
		children,
		value,
		description,
		size = 'medium',
		class: className = '',
		...rest
	}: Props = $props();

	const ctx = GetRadioGroupContext<T>();
	const radioId = `radio-${uid}`;
	const descId = `radio-desc-${uid}`;
</script>

<div class={['sh-radio', `size-${size}`, className]}>
	<div class="sh-radio__row">
		<input
			{...rest}
			type="radio"
			id={radioId}
			name={ctx?.name}
			value={value as string}
			checked={ctx?.value == value}
			aria-describedby={description ? descId : undefined}
			class="sh-radio__input"
			onchange={() => ctx?.onchange(value)}
		/>
		<label for={radioId} class="sh-radio__label">
			{@render children()}
		</label>
	</div>
	{#if description}
		<div id={descId} class="sh-radio__desc">
			{#if typeof description === 'string'}
				{description}
			{:else}
				{@render description()}
			{/if}
		</div>
	{/if}
</div>

<style>
	.sh-radio {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.sh-radio__row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.sh-radio__input {
		accent-color: var(--primary);
		width: 1rem;
		height: 1rem;
		margin: 0;
		cursor: pointer;
	}
	.sh-radio__label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--foreground);
		cursor: pointer;
	}
	.sh-radio__desc {
		padding-left: 1.5rem;
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}
</style>
