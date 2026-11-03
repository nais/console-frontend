<script lang="ts">
	import ActionMenu from '../../src/lib/shadcn/ui/ActionMenu.svelte';
	import ActionMenuItem from '../../src/lib/shadcn/ui/ActionMenuItem.svelte';
	import ActionMenuRadioGroup from '../../src/lib/shadcn/ui/ActionMenuRadioGroup.svelte';
	import ActionMenuRadioItem from '../../src/lib/shadcn/ui/ActionMenuRadioItem.svelte';
	import ActionMenuDivider from '../../src/lib/shadcn/ui/ActionMenuDivider.svelte';
	import Button from '../../src/lib/shadcn/ui/Button.svelte';
	import Modal from '../../src/lib/shadcn/ui/Modal.svelte';
	import Theme from '../../src/lib/shadcn/ui/Theme.svelte';

	let open = $state(false);
	let selected = $state('');
	let order = $state('name');
	let radioSelection = $state('');
	let linkEvent = $state('');
	let modalOpen = $state(false);
	let dark = $state(false);
</script>

<main>
	<Theme theme={dark ? 'dark' : 'light'}>
		<Button onclick={() => (dark = !dark)}>Toggle theme</Button>
		<Button onclick={() => (open = !open)}>Toggle controlled menu</Button>
		<div class="clipped-parent">
			<ActionMenu bind:open>
				{#snippet trigger(props)}<Button {...props}>Test actions</Button>{/snippet}
				<ActionMenuItem
					onselect={(event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
						(selected = `first:${event.currentTarget.tagName}`)}
				>
					First action
				</ActionMenuItem>
				<ActionMenuItem disabled onselect={() => (selected = 'disabled')}>
					Disabled action
				</ActionMenuItem>
				<ActionMenuItem onselect={() => (selected = 'last')}>Last action</ActionMenuItem>
				<ActionMenuDivider />
				<ActionMenuItem href="#destination">Native link</ActionMenuItem>
				<ActionMenuItem
					href="#dialog"
					onselect={(event) => {
						linkEvent = `${event.currentTarget.tagName}:${event.currentTarget.getAttribute('href')}`;
						if (event.ctrlKey || event.metaKey || event.shiftKey) return;
						event.preventDefault();
						modalOpen = true;
					}}>Open dialog</ActionMenuItem
				>
				<ActionMenuItem href="#disabled" disabled onselect={() => (selected = 'disabled-link')}
					>Disabled link</ActionMenuItem
				>
				<ActionMenuDivider />
				<ActionMenuRadioGroup bind:value={order} label="Order by">
					<ActionMenuRadioItem value="name" onselect={(value) => (radioSelection = value)}
						>Name</ActionMenuRadioItem
					>
					<ActionMenuRadioItem value="risk" onselect={(value) => (radioSelection = value)}
						>Risk</ActionMenuRadioItem
					>
					<ActionMenuRadioItem value="disabled" disabled>Disabled order</ActionMenuRadioItem>
				</ActionMenuRadioGroup>
			</ActionMenu>
		</div>
		<div class="outside-control">
			<Button onclick={() => (selected = 'outside')}>After menu</Button>
		</div>
		<output aria-label="Selected action">{selected}</output>
		<output aria-label="Selected order">{order}</output>
		<output aria-label="Radio callback">{radioSelection}</output>
		<output aria-label="Link event">{linkEvent}</output>
		<output aria-label="Menu open">{String(open)}</output>
		<Modal bind:open={modalOpen} header={{ heading: 'Action dialog' }}>
			<Button onclick={() => (modalOpen = false)}>Finish dialog</Button>
			<ActionMenu>
				{#snippet trigger(props)}<Button {...props}>Dialog actions</Button>{/snippet}
				<ActionMenuItem onselect={() => (selected = 'nested')}>Nested action</ActionMenuItem>
			</ActionMenu>
		</Modal>
	</Theme>
</main>

<style>
	main {
		padding: var(--ax-space-16);
	}

	.clipped-parent {
		width: var(--sh-popover-max-width);
		height: var(--ax-space-40);
		overflow: hidden;
	}

	.outside-control {
		display: flex;
		justify-content: flex-end;
	}
</style>
