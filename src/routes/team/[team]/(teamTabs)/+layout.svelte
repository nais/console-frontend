<script lang="ts">
	import { page } from '$app/stores';
	import Tabs from '$lib/Tabs.svelte';
	import Tab from '$lib/Tab.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import EmissionsIcon from '$lib/icons/EmissionsIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { replacer } from '$lib/replacer';

	$: team = $page.params.team;
	$: currentRoute = $page.route.id;
	const nav = [
		{
			tab: 'Workloads',
			routeId: '/team/[team]/(teamTabs)'
		},
		{
			tab: 'Members',
			routeId: '/team/[team]/(teamTabs)/members'
		},
		{
			tab: 'Settings',
			routeId: '/team/[team]/(teamTabs)/settings'
		},
		{
			tab: 'Deploy',
			routeId: '/team/[team]/(teamTabs)/deploy'
		},
		{
			tab: 'Billing',
			routeId: '/team/[team]/(teamTabs)/billing'
		}
	];
</script>

<div class="header">
	<h3>{team}</h3>
	<div class="headerItems">
		<span class="headerItem"><EmissionsIcon size="1.5rem" />1.02 T/mo</span>
		<span class="headerItem"><CostIcon />$123 413</span>
		<span class="headerItem"><MemoryIcon />123 MB</span>
		<span class="headerItem"><CpuIcon />0,38 cores</span>
	</div>
</div>

<Tabs>
	{#each nav as { tab, routeId }}
		<Tab href={replacer(routeId, { team })} active={currentRoute == routeId} title={tab} />
	{/each}
</Tabs>
<div class="container">
	<slot />
</div>

<style>
	.container {
		margin: auto;
		min-width: 1000px;
		max-width: 1432px;
		padding: 1rem;
	}
	.header {
		display: flex;
		justify-content: space-between;
	}
	.headerItems {
		display: flex;
		gap: 1rem;
	}
	.headerItem {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
	}
</style>
