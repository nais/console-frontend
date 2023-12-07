<script lang="ts">
	import { Button, TextField } from '@nais/ds-svelte-community';
	import { PencilIcon } from '@nais/ds-svelte-community/icons';
	import { createEventDispatcher } from 'svelte';

	export let text: string;
	export let variant: 'textfield' | 'textarea' = 'textarea';

	const distpatch = createEventDispatcher<{ save: string }>();

	let newText = text;
	let edit = false;
	let height: number;

	const reset = () => {
		newText = text;
		edit = false;
	};

	const save = () => {
		distpatch('save', newText);
		edit = false;
	};
</script>

<div style:height={height + 'px'} class:hidden={!edit}>
	{#if variant === 'textfield'}
		<TextField size="small" bind:value={newText} hideLabel={true} />
	{:else}
		<textarea
			class="navds-text-field__input navds-body-short navds-body-short--medium"
			bind:value={newText}
		/>
	{/if}
	<Button on:click={save} size="xsmall">Save</Button>
	<Button on:click={reset} size="xsmall" variant="secondary-neutral">Cancel</Button>
</div>

<div bind:clientHeight={height} class:hidden={edit}>
	<p class:tall={variant == 'textarea'}>{text}</p>
	<Button
		on:click={() => {
			edit = true;
		}}
		size="xsmall"
		iconOnly={true}
		variant="tertiary"
	>
		<svelte:fragment slot="icon-left"><PencilIcon /></svelte:fragment>
	</Button>
</div>

<style>
	div {
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	textarea {
		height: 100%;
	}

	.hidden {
		display: none;
	}

	p {
		margin: 0;
	}
	p.tall {
		margin: 0.5rem 0;
	}
</style>
