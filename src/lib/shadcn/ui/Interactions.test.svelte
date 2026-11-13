<script lang="ts">
	import ActionMenu from './ActionMenu.svelte';
	import ActionMenuItem from './ActionMenuItem.svelte';
	import { GetAccordionContext } from './Accordion.svelte';
	import Box from './Box.svelte';
	import { Button } from '@nais/ui';
	import CopyButton from './CopyButton.svelte';
	import Select from './Select.svelte';
	import Tab from './Tab.svelte';
	import TabList from './TabList.svelte';
	import TabPanel from './TabPanel.svelte';
	import Tabs, { GetTabsUiContext } from './Tabs.svelte';
	import Loader from './Loader.svelte';
	import NavTabs from './NavTabs.svelte';
	import { Theme } from '@nais/ui';
	import ToggleGroup from './ToggleGroup.svelte';
	import ToggleGroupItem from './ToggleGroupItem.svelte';
	import Tooltip from './Tooltip.svelte';
	import CollapsibleSidebar from '#lib/ui/CollapsibleSidebar.svelte';

	let selected = $state('');
	let drawerOpen = $state(false);
	const missingContexts = [GetAccordionContext(), GetTabsUiContext()].every(
		(context) => context === undefined
	);
	let { period = $bindable('one'), tab = $bindable('one') }: { period?: string; tab?: string } =
		$props();
</script>

<ActionMenu>
	{#snippet trigger(props)}<Button {...props}>Test actions</Button>{/snippet}
	<ActionMenuItem onselect={() => (selected = 'first')}>First action</ActionMenuItem>
	<ActionMenuItem disabled>Disabled action</ActionMenuItem>
	<ActionMenuItem onselect={() => (selected = 'last')}>Last action</ActionMenuItem>
</ActionMenu>
<output aria-label="Selected action">{selected}</output>

<Tooltip content="Tooltip help"><Button>Tooltip target</Button></Tooltip>
<Tooltip content="Static help"><span>Information</span></Tooltip>
<Tooltip content="Unavailable explanation"><Button disabled>Unavailable action</Button></Tooltip>

<p id="external-description">External description</p>
<Select
	label="Test selection"
	id="test-selection"
	description="Select description"
	error="Select error"
	aria-describedby="external-description"
	value="one"
>
	<option value="one">One</option>
	<option value="two">Two</option>
</Select>
<CopyButton copyText="Copied value" text="Test copy" activeDuration={100} />

<Tabs bind:value={tab}>
	<TabList aria-label="Test tabs">
		<Tab value="one">First tab</Tab>
		<Tab value="two">Second tab</Tab>
	</TabList>
	<TabPanel value="one">First panel</TabPanel>
	<TabPanel value="two">Second panel</TabPanel>
</Tabs>
<ToggleGroup label="Test period" bind:value={period}>
	<ToggleGroupItem value="one">First period</ToggleGroupItem>
	<ToggleGroupItem value="two">Second period</ToggleGroupItem>
</ToggleGroup>
<output aria-label="Selected period">{period}</output>
<output aria-label="Optional contexts" data-missing={missingContexts}></output>

<Box
	data-testid="compat-box"
	padding="space-24"
	borderRadius="12"
	borderColor="neutral-subtleA"
	borderWidth="2"
	background="neutral-soft"
	shadow="medium">Box content</Box
>
<div id="theme-host">
	<Theme><dialog>Theme dialog</dialog></Theme>
</div>
<Loader title="Compatibility loading" />
<NavTabs
	ariaLabel="Compatibility navigation"
	value="overview"
	items={[
		{ value: 'overview', label: 'Navigation overview', href: '#overview' },
		{ value: 'details', label: 'Navigation details', href: '#details' }
	]}
/>
<Button onclick={() => (drawerOpen = true)}>Open test filters</Button>
<CollapsibleSidebar bind:open={drawerOpen}>
	<p>Test filter content</p>
</CollapsibleSidebar>
