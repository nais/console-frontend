<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		hideLabel?: boolean;
		loading?: boolean;
		position?: 'left' | 'right';
		description?: string;
		size?: 'medium' | 'small';
		disabled?: boolean;
		checked?: boolean;
		children: Snippet;
		id?: string;
		[key: string]: unknown;
	}

	const uid = $props.id();

	let {
		hideLabel = false,
		loading = false,
		position = 'left',
		description,
		size = 'medium',
		disabled = false,
		checked = $bindable(false),
		children,
		id = `sw-${uid}`,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div class={['sh-switch-wrapper', `position-${position}`, className]}>
	<input
		{...rest}
		type="checkbox"
		role="switch"
		{id}
		disabled={disabled || loading}
		bind:checked
		class={['sh-switch-input', `size-${size}`]}
	/>
	<div class="sh-switch-text" class:sr-only={hideLabel}>
		<label for={id} class="sh-switch-label">
			{@render children()}
		</label>
		{#if description}
			<span class="sh-switch-desc">{description}</span>
		{/if}
	</div>
</div>

<style>
	.sh-switch-wrapper {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
	}
	.sh-switch-wrapper.position-right {
		flex-direction: row-reverse;
		justify-content: space-between;
	}
	.sh-switch-input {
		appearance: none;
		position: relative;
		width: 2.25rem;
		height: 1.25rem;
		border-radius: 9999px;
		background-color: var(--input);
		border: 1px solid var(--border-strong);
		cursor: pointer;
		flex-shrink: 0;
		transition: background-color 140ms ease;
	}
	.sh-switch-input.size-small {
		width: 1.875rem;
		height: 1.0625rem;
	}
	.sh-switch-input::after {
		content: '';
		position: absolute;
		top: 1px;
		left: 1px;
		width: calc(1.25rem - 4px);
		height: calc(1.25rem - 4px);
		border-radius: 9999px;
		background-color: var(--card);
		box-shadow: var(--sh-shadow-xs);
		transition: transform 140ms ease;
	}
	.sh-switch-input.size-small::after {
		width: calc(1.0625rem - 4px);
		height: calc(1.0625rem - 4px);
	}
	.sh-switch-input:checked {
		background-color: var(--primary);
		border-color: var(--primary);
	}
	.sh-switch-input:checked::after {
		transform: translateX(1rem);
		background-color: var(--primary-foreground);
	}
	.sh-switch-input.size-small:checked::after {
		transform: translateX(0.8125rem);
	}
	.sh-switch-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.sh-switch-text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.sh-switch-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--foreground);
		cursor: pointer;
	}
	.sh-switch-desc {
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
