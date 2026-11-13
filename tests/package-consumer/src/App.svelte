<script lang="ts">
	import {
		Button,
		Modal,
		Theme,
		type ButtonProps,
		type ModalHeaderProps,
		type ModalProps,
		type ThemeProps
	} from '@nais/ui';
	import './app.css';

	let open = $state(false);
	let clicks = $state(0);
	let submitted = $state(0);
	let buttonRef = $state<Element>();
	const header: ModalHeaderProps = { heading: 'Package dialog', label: 'Shared UI' };
	const theme: ThemeProps['theme'] = 'light';
	const variant: ButtonProps['variant'] = 'secondary-neutral';
	const width: ModalProps['width'] = 'small';
</script>

<main>
	<h1>UI package consumer</h1>
	<Theme theme="dark" data-testid="outer-dark">
		<Button>Dark button</Button>
		<Theme {theme} data-testid="inner-light">
			<Button onclick={() => (open = true)}>Open package dialog</Button>
			<Button {variant} bind:ref={buttonRef} onclick={() => (clicks += 1)}>Count clicks</Button>
			<Button loading>Loading button</Button>
			<Button disabled onclick={() => (clicks += 1)}>Disabled button</Button>
			<Button href="#destination">Link button</Button>
			<Button href="#disabled" disabled>Disabled link</Button>
			<form
				onsubmit={(event) => {
					event.preventDefault();
					submitted += 1;
				}}
			>
				<Button type="submit">Submit button</Button>
			</form>
			<output aria-label="Clicks">{clicks}</output>
			<output aria-label="Submissions">{submitted}</output>
			<output aria-label="Button ref">{buttonRef?.tagName ?? ''}</output>
			<Modal bind:open {header} {width}>
				<label>Package draft <input /></label>
				{#snippet footer()}
					<Button onclick={() => (open = false)}>Finish</Button>
				{/snippet}
			</Modal>
			<Theme theme="dark" data-testid="inner-dark">
				<Button>Nested dark button</Button>
			</Theme>
		</Theme>
	</Theme>
</main>
