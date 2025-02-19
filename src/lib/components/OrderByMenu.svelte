<script module>
	export const urlToOrderField = <T extends { [key: string]: T[keyof T] }>(
		orderField: T,
		defaultValue: T[keyof T],
		url: URL
	): T[keyof T] =>
		Object.values(orderField).find((field) =>
			url.searchParams.get('sort')?.startsWith(field as string)
		) ?? defaultValue;

	export const urlToOrderDirection = (url: URL) =>
		Object.values(OrderDirection).find((dir) => url.searchParams.get('sort')?.endsWith(dir)) ??
		OrderDirection.ASC;
</script>

<script lang="ts">
	import { page } from '$app/state';
	import { OrderDirection } from '$houdini';
	import SortAscendingIcon from '$lib/icons/SortAscendingIcon.svelte';
	import SortDescendingIcon from '$lib/icons/SortDescendingIcon.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental.js';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';

	const {
		OrderField,
		defaultOrderField
	}: {
		OrderField: { [key: string]: string };
		defaultOrderField: string;
	} = $props();

	const orderField = $derived(
		Object.values(OrderField).find((field) =>
			page.url.searchParams.get('sort')?.startsWith(field)
		) ?? defaultOrderField
	);

	const orderDirection = $derived(
		Object.values(OrderDirection).find((dir) => page.url.searchParams.get('sort')?.endsWith(dir)) ??
			OrderDirection.ASC
	);

	const fieldLabel = (fieldName: string) => {
		switch (fieldName) {
			case 'DEPLOYMENT_TIME':
				return 'Deploy';
			default:
				return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase();
		}
	};
</script>

<ActionMenu>
	{#snippet trigger(props)}
		<Button
			variant="tertiary-neutral"
			size="small"
			iconPosition="right"
			icon={ChevronDownIcon}
			{...props}
		>
			<div style="display: flex; align-items: center; gap: var(--a-spacing-2);">
				{#if orderDirection === OrderDirection.ASC}
					<SortAscendingIcon />
				{:else}
					<SortDescendingIcon />
				{/if}
				{fieldLabel(orderField)}
			</div>
		</Button>
	{/snippet}
	{#key orderField}
		<ActionMenuRadioGroup value={orderField} label="Order by">
			{#each Object.values(OrderField).sort( (a) => (a === defaultOrderField ? -1 : 1) ) as field (field)}
				<ActionMenuRadioItem
					value={field}
					onselect={(value) => changeParams({ sort: `${value}-${orderDirection}` })}
				>
					{fieldLabel(field)}
				</ActionMenuRadioItem>
			{/each}
		</ActionMenuRadioGroup>
	{/key}
	<ActionMenuDivider />
	{#key orderDirection}
		<ActionMenuRadioGroup value={orderDirection} label="Sort direction">
			{#each Object.values(OrderDirection) as direction (direction)}
				<ActionMenuRadioItem
					value={direction}
					onselect={(value) => changeParams({ sort: `${orderField}-${value}` })}
				>
					{#if direction === OrderDirection.ASC}
						<SortAscendingIcon /> Ascending
					{:else}
						<SortDescendingIcon /> Descending
					{/if}
				</ActionMenuRadioItem>
			{/each}
		</ActionMenuRadioGroup>
	{/key}
</ActionMenu>
