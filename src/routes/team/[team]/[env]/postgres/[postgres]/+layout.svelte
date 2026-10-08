<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import HeaderActions from '#lib/ui/HeaderActions.svelte';
	import { Button, Tab, TabList, Tabs } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuItem
	} from '@nais/ds-svelte-community/experimental';
	import {
		MenuElipsisVerticalIcon,
		PencilWritingIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let routeId = $derived(page.route.id ?? '');
	let tabs = $derived([
		{
			value: '/team/[team]/[env]/postgres/[postgres]',
			label: 'Overview',
			href: resolve('/team/[team]/[env]/postgres/[postgres]', page.params as never)
		},
		{
			value: '/team/[team]/[env]/postgres/[postgres]/branches',
			label: 'Branches',
			href: resolve('/team/[team]/[env]/postgres/[postgres]/branches', page.params as never)
		},
		{
			value: '/team/[team]/[env]/postgres/[postgres]/insights',
			label: 'Insights',
			href: resolve('/team/[team]/[env]/postgres/[postgres]/insights', page.params as never)
		}
	]);
	let visibleTabs = $derived(tabs.some((tab) => tab.value === routeId) ? tabs : []);
</script>

{#if visibleTabs.length > 0 && (data.viewerIsMember || data.isAdmin)}
	<HeaderActions>
		<ActionMenu>
			{#snippet trigger(props)}
				<Button
					variant="secondary"
					size="small"
					icon={MenuElipsisVerticalIcon}
					iconPosition="right"
					{...props}
				>
					Actions
				</Button>
			{/snippet}
			<a
				class="action-menu-button"
				href="/team/{page.params.team}/{page.params.env}/postgres/{page.params.postgres}/edit"
			>
				<ActionMenuItem icon={PencilWritingIcon}>Edit</ActionMenuItem>
			</a>
			<ActionMenuDivider />
			<a
				class="action-menu-button"
				href="/team/{page.params.team}/{page.params.env}/postgres/{page.params.postgres}/delete"
			>
				<ActionMenuItem icon={TrashIcon} variant="danger">Delete</ActionMenuItem>
			</a>
		</ActionMenu>
	</HeaderActions>
{/if}

{#if visibleTabs.length > 0}
	<Tabs value={routeId} size="small">
		<TabList>
			{#each visibleTabs as tab (tab.value)}
				<Tab value={tab.value} as="a" href={tab.href}>{tab.label}</Tab>
			{/each}
		</TabList>
		<div class="tab-content">
			{@render children()}
		</div>
	</Tabs>
{:else}
	{@render children()}
{/if}

<style>
	.action-menu-button {
		all: unset;
		display: contents;

		:global(*) {
			cursor: pointer;
		}
	}
</style>
