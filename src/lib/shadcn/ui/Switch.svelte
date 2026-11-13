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
		gap: var(--nais-space-8);
	}
	.sh-switch-wrapper.position-right {
		flex-direction: row-reverse;
		justify-content: space-between;
	}
	.sh-switch-input {
		appearance: none;
		position: relative;
		width: var(--nais-space-36);
		height: var(--nais-space-20);
		border-radius: var(--radius-full);
		background-color: var(--input);
		border: var(--sh-border-width) solid var(--border-strong);
		cursor: pointer;
		flex-shrink: 0;
		transition: background-color 140ms ease;
	}
	.sh-switch-input.size-small {
		width: var(--nais-space-28);
		height: var(--nais-space-16);
	}
	.sh-switch-input::after {
		content: '';
		position: absolute;
		top: var(--nais-space-1);
		left: var(--nais-space-1);
		width: calc(var(--nais-space-20) - var(--nais-space-4));
		height: calc(var(--nais-space-20) - var(--nais-space-4));
		border-radius: var(--radius-full);
		background-color: var(--card);
		box-shadow: var(--sh-shadow-xs);
		transition: transform 140ms ease;
	}
	.sh-switch-input.size-small::after {
		width: calc(var(--nais-space-16) - var(--nais-space-4));
		height: calc(var(--nais-space-16) - var(--nais-space-4));
	}
	.sh-switch-input:checked {
		background-color: var(--primary);
		border-color: var(--primary);
	}
	.sh-switch-input:checked::after {
		transform: translateX(var(--nais-space-16));
		background-color: var(--primary-foreground);
	}
	.sh-switch-input.size-small:checked::after {
		transform: translateX(calc(var(--nais-space-12) + var(--nais-space-1)));
	}
	.sh-switch-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.sh-switch-text {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-2);
	}
	.sh-switch-label {
		font-size: var(--sh-font-size-sm);
		font-weight: var(--sh-font-weight-medium);
		color: var(--foreground);
		cursor: pointer;
	}
	.sh-switch-desc {
		font-size: var(--sh-font-size-xs);
		color: var(--muted-foreground);
	}
	.sr-only {
		position: absolute;
		width: var(--nais-space-1);
		height: var(--nais-space-1);
		padding: 0;
		margin: calc(-1 * var(--nais-space-1));
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
