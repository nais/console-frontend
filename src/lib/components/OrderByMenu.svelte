<script module>
	type ValueOf<T> = T[keyof T];

	export type OrderField = {
		[s: string]: string;
	};

	export const urlToOrderField = <T extends OrderField>(
		orderField: T,
		defaultValue: ValueOf<T>,
		url: URL
	): ValueOf<T> =>
		(Object.values(orderField).find((field) => url.searchParams.get('sort')?.startsWith(field)) as
			| ValueOf<T>
			| undefined) ?? defaultValue;

	export const urlToOrderDirection = (url: URL) =>
		Object.values(OrderDirection).find((dir) => url.searchParams.get('sort')?.endsWith(dir)) ??
		OrderDirection.ASC;
</script>

<script lang="ts" generics="T extends OrderField">
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

	interface Props {
		orderField: T;
		defaultOrderField: ValueOf<T>;
	}

	const { orderField, defaultOrderField }: Props = $props();

	const currentOrderField = $derived(
		Object.values(orderField).find((field) =>
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
				{fieldLabel(currentOrderField)}
			</div>
		</Button>
	{/snippet}
	{#key orderField}
		<ActionMenuRadioGroup value={currentOrderField} label="Order by">
			{#each Object.values(orderField).sort( (a) => (a === defaultOrderField ? -1 : 1) ) as field (field)}
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
					onselect={(value) => changeParams({ sort: `${currentOrderField}-${value}` })}
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
