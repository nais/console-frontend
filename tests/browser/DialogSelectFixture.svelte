<script lang="ts">
	import Modal from '../../src/lib/shadcn/ui/Modal.svelte';
	import Button from '../../src/lib/shadcn/ui/Button.svelte';
	import Select from '../../src/lib/shadcn/ui/Select.svelte';
	import Heading from '../../src/lib/shadcn/ui/Heading.svelte';
	import Theme from '../../src/lib/shadcn/ui/Theme.svelte';
	import CollapsibleSidebar from '../../src/lib/ui/CollapsibleSidebar.svelte';

	let open = $state(false);
	let nestedOpen = $state(false);
	let drawerOpen = $state(false);
	let nonModalOpen = $state(false);
	let conditionalOpen = $state(false);
	let dark = $state(false);
	let guarded = $state(false);
	let backdropCloses = $state(true);
	let preventCancel = $state(false);
	let closeEvents = $state(0);
	let closeType = $state('');
	let cancelType = $state('');
	let headerType = $state('object');
	let longContent = $state(false);
	let placement = $state<'top' | 'center'>('center');
	let explicitLabel = $state(false);
	let selected = $state('one');
	let number = $state(1);
	const objects = [{ name: 'First object' }, { name: 'Second object' }];
	let object = $state(objects[0]);
	let multiple = $state(['one']);
	let changeEvent = $state('');
	let formResult = $state('');
	let filter = $state('dev');
	let selectError = $state(true);
	let selectedId = $state('explicit-selection');
	let showOption = $state(false);
</script>

{#snippet snippetHeader()}
	<Heading level="2" size="small">Snippet dialog</Heading>
{/snippet}

<main>
	<div class="application-chrome" aria-hidden="true"></div>
	<Theme theme={dark ? 'dark' : 'light'}>
		<div class="controls">
			<Button onclick={() => (dark = !dark)}>Toggle theme</Button>
			<Button onclick={() => (headerType = 'string')}>Use string header</Button>
			<Button onclick={() => (headerType = 'snippet')}>Use snippet header</Button>
			<Button onclick={() => (longContent = true)}>Use long content</Button>
			<Button onclick={() => (placement = 'top')}>Use top placement</Button>
			<Button onclick={() => (explicitLabel = true)}>Use explicit label</Button>
			<Button onclick={() => (open = true)}>Open modal</Button>
			<Button onclick={() => (conditionalOpen = true)}>Open conditional modal</Button>
			<Button onclick={() => (nonModalOpen = true)}>Open non-modal</Button>
			<Button onclick={() => (drawerOpen = true)}>Open filters</Button>
		</div>
		<h2 id="external-modal-label">External dialog label</h2>
		<output aria-label="Modal open">{String(open)}</output>
		<output aria-label="Close events">{closeEvents}</output>
		<output aria-label="Close event type">{closeType}</output>
		<output aria-label="Cancel event type">{cancelType}</output>
		<output aria-label="Drawer open">{String(drawerOpen)}</output>
		<output aria-label="Selected filter">{filter}</output>
		<Modal
			bind:open
			id="explicit-modal"
			width={640}
			{placement}
			header={headerType === 'object'
				? { heading: 'Test dialog', label: 'Dialog label', size: 'small' }
				: headerType === 'string'
					? 'String dialog'
					: snippetHeader}
			aria-labelledby={explicitLabel ? 'external-modal-label' : undefined}
			aria-describedby="modal-description"
			closeOnBackdropClick={backdropCloses}
			onBeforeClose={() => !guarded}
			oncancel={(event) => {
				cancelType = event.type;
				if (preventCancel) event.preventDefault();
			}}
			onclose={(event) => {
				closeEvents += 1;
				closeType = event.type;
			}}
		>
			<p id="modal-description">Test dialog description</p>
			<label>Draft <input name="draft" /></label>
			<label><input type="checkbox" bind:checked={guarded} />Block dismissal</label>
			<label><input type="checkbox" bind:checked={backdropCloses} />Close on backdrop</label>
			<label><input type="checkbox" bind:checked={preventCancel} />Prevent cancel event</label>
			<Button onclick={() => (nestedOpen = true)}>Open nested dialog</Button>
			<Modal bind:open={nestedOpen} header="Nested dialog">
				<label>Nested input <input /></label>
				<Button onclick={() => (nestedOpen = false)}>Finish nested</Button>
			</Modal>
			{#if longContent}
				{#each Array.from({ length: 60 }, (_, i) => i) as i (i)}
					<p>Scrollable dialog content {i}</p>
				{/each}
			{/if}
			{#snippet footer()}
				<Button onclick={() => (open = false)}>Save and close</Button>
			{/snippet}
		</Modal>
		{#if conditionalOpen}
			<Modal bind:open={conditionalOpen} header="Conditional dialog">
				<p>Conditionally mounted content</p>
			</Modal>
		{/if}
		<Modal bind:open={nonModalOpen} isModal={false} header="Non-modal dialog">
			<label>Non-modal input <input /></label>
		</Modal>
		<CollapsibleSidebar bind:open={drawerOpen}>
			<Select label="Filter environment" bind:value={filter}>
				<option value="dev">Development</option>
				<option value="prod">Production</option>
			</Select>
			<p>Filter content</p>
			{#snippet extras()}<p>Sidebar extras</p>{/snippet}
		</CollapsibleSidebar>
		<form
			onsubmit={(event) => {
				event.preventDefault();
				formResult = JSON.stringify([...new FormData(event.currentTarget).entries()]);
			}}
		>
			<p id="external-select-description">External selection description</p>
			<Select
				label="Test selection"
				id={selectedId}
				name="selection"
				description="Select description"
				error={selectError ? 'Select error' : undefined}
				aria-describedby="external-select-description"
				bind:value={selected}
				onchange={(event) =>
					(changeEvent = `${event.currentTarget.tagName}:${event.currentTarget.value}`)}
			>
				<option value="one">One</option>
				<option value="two">Two</option>
				<option value="disabled" disabled>Disabled option</option>
				{#if showOption}<option value="three">Three</option>{/if}
			</Select>
			<Select label="Number selection" name="number" bind:value={number}>
				<option value={1}>First number</option>
				<option value={2}>Second number</option>
			</Select>
			<Select label="Object selection" bind:value={object}>
				{#each objects as item (item.name)}
					<option value={item}>{item.name}</option>
				{/each}
			</Select>
			<Select label="Multiple selection" name="multiple" multiple bind:value={multiple}>
				<option value="one">One</option>
				<option value="two">Two</option>
			</Select>
			<Select label="Disabled selection" name="disabled" disabled value="one">
				<option value="one">One</option>
			</Select>
			<Select label="Read-only selection" name="readonly" readonly value="one">
				<option value="one">One</option>
			</Select>
			<Select label="Hidden selection label" hideLabel size="small" value="one">
				<option value="one">One</option>
			</Select>
			<Button type="submit">Submit selections</Button>
			<Button type="reset">Reset selections</Button>
		</form>
		<Button onclick={() => (selectError = false)}>Clear select error</Button>
		<Button onclick={() => (selected = 'two')}>Set selection externally</Button>
		<Button onclick={() => (selectedId = 'updated-selection')}>Change selection ID</Button>
		<Button onclick={() => (showOption = true)}>Add option</Button>
		<output aria-label="Selection">{selected}</output>
		<output aria-label="Number value">{typeof number}:{number}</output>
		<output aria-label="Object value">{object.name}</output>
		<output aria-label="Multiple values">{multiple.join(',')}</output>
		<output aria-label="Change event">{changeEvent}</output>
		<output aria-label="Form result">{formResult}</output>
	</Theme>
</main>

<style>
	main {
		padding: var(--nais-space-16);
	}
	.application-chrome {
		position: fixed;
		inset: 0 auto auto 0;
		width: var(--nais-space-8);
		height: var(--nais-space-8);
		z-index: 1000;
		background: var(--muted);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--nais-space-8);
	}
	form {
		display: grid;
		gap: var(--nais-space-16);
	}
</style>
