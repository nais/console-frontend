<script lang="ts">
	import ActionMenu from './ActionMenu.svelte';
	import ActionMenuItem from './ActionMenuItem.svelte';
	import Button from './Button.svelte';
	import CopyButton from './CopyButton.svelte';
	import Select from './Select.svelte';
	import Tab from './Tab.svelte';
	import TabList from './TabList.svelte';
	import Tabs from './Tabs.svelte';
	import ToggleGroup from './ToggleGroup.svelte';
	import ToggleGroupItem from './ToggleGroupItem.svelte';
	import Tooltip from './Tooltip.svelte';

	let selected = $state('');
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
</Tabs>
<ToggleGroup label="Test period" bind:value={period}>
	<ToggleGroupItem value="one">First period</ToggleGroupItem>
	<ToggleGroupItem value="two">Second period</ToggleGroupItem>
</ToggleGroup>
<output aria-label="Selected period">{period}</output>
