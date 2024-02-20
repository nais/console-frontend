<script lang="ts">
	import { Button, Modal } from '@nais/ds-svelte-community';
	import type { ButtonProps } from '@nais/ds-svelte-community/dist/components/Button/Button.svelte';
	import { createEventDispatcher } from 'svelte';

	export let confirmText = 'Confirm';
	export let open = false;
	export let variant: ButtonProps['variant'] = 'primary';

	const dispatch = createEventDispatcher();

	const cancel = () => {
		open = false;
		dispatch('cancel');
	};

	const confirm = () => {
		open = false;
		dispatch('confirm');
	};
</script>

<Modal bind:open on:close>
	<svelte:fragment slot="header">
		<slot name="header" />
	</svelte:fragment>

	<div class="wrapper">
		<slot />
	</div>

	<svelte:fragment slot="footer">
		<Button {variant} type="submit" on:click={confirm}>{confirmText}</Button>
		<Button variant="tertiary" type="reset" on:click={cancel}>Cancel</Button>
	</svelte:fragment>
</Modal>

<style>
	.wrapper {
		width: 500px;
	}
</style>
