<script lang="ts">
	import { Alert, Button, Loader, Modal } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	interface Props {
		confirmText?: string;
		open?: boolean;
		variant?:
			| 'primary'
			| 'primary-neutral'
			| 'secondary'
			| 'secondary-neutral'
			| 'tertiary'
			| 'tertiary-neutral'
			| 'danger';
		header?: Snippet;
		children: Snippet;
		onconfirm: () => Promise<{ ok: boolean; message: string }>;
	}

	let {
		confirmText = 'Confirm',
		open = $bindable(false),
		variant = 'primary',
		header,
		children,
		onconfirm
	}: Props = $props();

	let status: 'idle' | 'executing' | 'success' | 'error' = $state('idle');
	let resultMessage = $state('');
	let closeButtonEl: HTMLButtonElement | undefined = $state();

	const reset = () => {
		status = 'idle';
		resultMessage = '';
	};

	const close = () => {
		open = false;
		reset();
	};

	const confirm = async () => {
		status = 'executing';
		const result = await onconfirm();
		resultMessage = result.message;
		status = result.ok ? 'success' : 'error';
		queueMicrotask(() => closeButtonEl?.focus());
	};
</script>

<Modal bind:open onclose={close} {header}>
	<div class="wrapper" role="status" aria-live="polite" aria-atomic="true">
		{#if status === 'idle'}
			{@render children()}
		{:else if status === 'executing'}
			<div class="loading" aria-label="Processing" role="status">
				<Loader size="xlarge" />
			</div>
		{:else}
			<Alert variant={status} size="small">
				{resultMessage}
			</Alert>
		{/if}
	</div>

	{#snippet footer()}
		{#if status === 'idle'}
			<Button {variant} size="small" type="submit" onclick={confirm}>{confirmText}</Button>
			<Button variant="tertiary" size="small" type="reset" onclick={close}>Cancel</Button>
		{:else if status === 'executing'}
			<Button {variant} size="small" disabled>{confirmText}</Button>
		{:else}
			<Button variant="tertiary" size="small" onclick={close} bind:ref={closeButtonEl}>Close</Button
			>
		{/if}
	{/snippet}
</Modal>

<style>
	.wrapper {
		width: 500px;
	}

	.loading {
		display: flex;
		justify-content: center;
		padding: var(--ax-space-12) 0;
	}
</style>
