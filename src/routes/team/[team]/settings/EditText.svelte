<script lang="ts">
	import { Button, TextField } from '#lib/shadcn/ui/index.js';
	import { PencilIcon } from '#lib/icons/index.js';

	interface Props {
		text: string;
		isMember: boolean;
		variant?: 'textfield' | 'textarea';
		onsave?: (text: string) => void;
	}

	let { text, variant = 'textarea', isMember, onsave }: Props = $props();

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
		onsave?.(newText);
		edit = false;
	};
</script>

{#if edit}
	<div style:height={height + 'px'} class:hidden={!edit}>
		{#if variant === 'textfield'}
			<TextField label="" size="small" bind:value={newText} hideLabel={true} />
		{:else}
			<textarea class="edit-textarea" bind:value={newText}></textarea>
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
		gap: var(--nais-space-8);
	}

	textarea {
		height: 100%;
		padding: var(--nais-space-6) var(--nais-space-10);
		border-radius: var(--radius-sm);
		border: var(--sh-border-width) solid var(--input);
		background-color: var(--background);
		color: var(--foreground);
		font: inherit;
		font-size: var(--sh-font-size-sm);
		box-sizing: border-box;
	}

	.hidden {
		display: none;
	}

	span {
		margin: 0;
	}
	span.tall {
		margin: var(--nais-space-8) 0;
	}
</style>
