<script lang="ts">
	import { Button, Modal } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';

	export let confirmText = 'Confirm';
	export let open = false;
	export let variant:
		| 'primary'
		| 'primary-neutral'
		| 'secondary'
		| 'secondary-neutral'
		| 'tertiary'
		| 'tertiary-neutral'
		| 'danger' = 'primary';

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
