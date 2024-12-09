<script lang="ts">
	import { Button, Modal } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';

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
		header?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let {
		confirmText = 'Confirm',
		open = $bindable(false),
		variant = 'primary',
		header,
		children
	}: Props = $props();

	const dispatch = createEventDispatcher();

	const cancel = () => {
		open = false;
		dispatch('cancel');
	};

	const confirm = () => {
		open = false;
		dispatch('confirm');
	};

	const header_render = $derived(header);
</script>

<Modal bind:open onClose={close}>
	{#snippet header()}
		{@render header_render?.()}
	{/snippet}

	<div class="wrapper">
		{@render children?.()}
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
