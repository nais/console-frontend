<script lang="ts">
	import { Button, Modal } from '@nais/ds-svelte-community';
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
		onconfirm: () => void;
		oncancel?: () => void;
		onclose?: () => void;
	}

	let {
		confirmText = 'Confirm',
		open = $bindable(false),
		variant = 'primary',
		header,
		children,
		onconfirm,
		oncancel,
		onclose
	}: Props = $props();

	const cancel = () => {
		open = false;
		oncancel?.();
	};

	const confirm = () => {
		open = false;
		onconfirm();
	};
</script>

<Modal bind:open {onclose} {header}>
	<div class="wrapper">
		{@render children()}
	</div>

	{#snippet footer()}
		<Button {variant} type="submit" onclick={confirm}>{confirmText}</Button>
		<Button variant="tertiary" type="reset" onclick={cancel}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	.wrapper {
		width: 500px;
	}
</style>
