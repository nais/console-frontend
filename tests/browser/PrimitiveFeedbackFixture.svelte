<script lang="ts">
	import Loader from '../../src/lib/shadcn/ui/Loader.svelte';
	import Heading from '../../src/lib/shadcn/ui/Heading.svelte';
	import AddToFavorites from '../../src/lib/ui/AddToFavorites.svelte';
	import Theme from '../../src/lib/shadcn/ui/Theme.svelte';
	import Button from '../../src/lib/shadcn/ui/Button.svelte';
	import ActionMenu from '../../src/lib/shadcn/ui/ActionMenu.svelte';
	import ActionMenuItem from '../../src/lib/shadcn/ui/ActionMenuItem.svelte';
	import Modal from '../../src/lib/shadcn/ui/Modal.svelte';

	const sizes = ['3xlarge', '2xlarge', 'xlarge', 'large', 'medium', 'small', 'xsmall'] as const;
	const headingSizes = ['xlarge', 'large', 'medium', 'small', 'xsmall'] as const;
	let nestedTheme = $state<'light' | 'dark'>('light');
	let dialogOpen = $state(false);
</script>

<main>
	<AddToFavorites path="/team/feedback-fixture" />
	{#each sizes as size (size)}
		<Loader {size} title={`Loading ${size}`} />
	{/each}
	<Loader title="Styled loading" size="large" style="color: var(--ax-text-accent)" />
	{#each headingSizes as size (size)}
		<Heading as="h2" {size} spacing>{size} heading</Heading>
	{/each}
	<Theme theme="light" data-testid="light-reference">Light reference</Theme>
	<Theme theme="dark" data-testid="dark-parent">
		<Theme data-testid="inherited-dark">Inherited dark theme</Theme>
		<Theme theme={nestedTheme} data-testid="nested-theme">
			<Theme data-testid="inherited-theme">Inherited nested theme</Theme>
			<Theme theme="dark" data-testid="nested-dark">Explicit dark descendant</Theme>
			<ActionMenu>
				{#snippet trigger(props)}<Button {...props}>Nested theme actions</Button>{/snippet}
				<ActionMenuItem>Nested theme action</ActionMenuItem>
			</ActionMenu>
			<Button onclick={() => (dialogOpen = true)}>Open themed dialog</Button>
			<Modal bind:open={dialogOpen} header="Themed dialog">
				<Button onclick={() => (nestedTheme = nestedTheme === 'light' ? 'dark' : 'light')}>
					Toggle dialog theme
				</Button>
			</Modal>
		</Theme>
	</Theme>
</main>
