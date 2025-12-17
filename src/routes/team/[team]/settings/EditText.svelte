<script lang="ts">
	import { Button, TextField } from '@nais/ds-svelte-community';
	import { PencilIcon } from '@nais/ds-svelte-community/icons';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		text: string;
		isMember: boolean;
		variant?: 'textfield' | 'textarea';
	}

	let { text, variant = 'textarea', isMember }: Props = $props();

	const distpatch = createEventDispatcher<{ save: string }>();

	let edit = $state(false);
	let newText = $state('');

	$effect.pre(() => {
		if (edit) {
			newText = text;
		}
	});

	let height: number | undefined = $state(undefined);

	const reset = () => {
		newText = text;
		edit = false;
	};

	const save = () => {
		distpatch('save', newText);
		edit = false;
	};
</script>

{#if edit}
	<div style:height={height + 'px'} class:hidden={!edit}>
		{#if variant === 'textfield'}
			<TextField label="" size="small" bind:value={newText} hideLabel={true} />
		{:else}
			<textarea
				class="aksel-text-field__input aksel-body-short aksel-body-short--medium"
				bind:value={newText}
			></textarea>
		{/if}
		<Button onclick={save} size="xsmall" disabled={!isMember}>Save</Button>
		<Button onclick={reset} size="xsmall" variant="secondary-neutral">Cancel</Button>
	</div>
{:else if height !== undefined}
	<div bind:clientHeight={height} class:hidden={edit}>
		<span class:tall={variant == 'textarea'}>{text}</span>
		{#if isMember}
			<Button
				onclick={() => {
					edit = true;
				}}
				size="xsmall"
				variant="tertiary"
				icon={PencilIcon}
			/>
		{/if}
	</div>
{:else}
	<!--
		some weird problems when doing server side rendering. Reduce jumping by rendering with less components
	-->
	<span bind:clientHeight={height}>{text}</span>
{/if}

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

	span {
		margin: 0;
	}
	span.tall {
		margin: 0.5rem 0;
	}
</style>
