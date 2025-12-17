<script module lang="ts">
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

	export const urlToOrderDirection = (
		url: URL,
		defaultDirection: OrderDirection$options = OrderDirection.ASC
	) =>
		Object.values(OrderDirection).find((dir) => url.searchParams.get('sort')?.endsWith(dir)) ??
		defaultDirection;
</script>

<script lang="ts" generics="T extends OrderField">
	import { page } from '$app/state';
	import { OrderDirection, type OrderDirection$options } from '$houdini';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon, SortDownIcon, SortUpIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		orderField: T;
		defaultOrderField: ValueOf<T>;
		defaultOrderDirection?: OrderDirection$options;
		onlyInclude?: ValueOf<T>[];
	}

	const {
		orderField,
		defaultOrderField,
		defaultOrderDirection = OrderDirection.ASC,
		onlyInclude
	}: Props = $props();

	const orderFieldWeights: Record<string, number> = {
		NAME: 0,
		DEPLOYMENT_TIME: 10,
		VULNERABILITY_RISK_SCORE: 20,
		VULNERABILITY_LAST_SCANNED: 30,
		HAS_SBOM: 40,
		VULNERABILITY_SEVERITY_CRITICAL: 50,
		VULNERABILITY_SEVERITY_HIGH: 60,
		VULNERABILITY_SEVERITY_MEDIUM: 70,
		VULNERABILITY_SEVERITY_LOW: 80,
		VULNERABILITY_SEVERITY_UNASSIGNED: 90,
		RISK_SCORE: 100,
		CRITICAL_VULNERABILITIES: 110,
		HIGH_VULNERABILITIES: 120,
		MEDIUM_VULNERABILITIES: 130,
		LOW_VULNERABILITIES: 140,
		UNASSIGNED_VULNERABILITIES: 150,
		SBOM_COVERAGE: 160,
		SLUG: 170
	};

	const currentOrderField = $derived(
		Object.values(orderField).find((field) =>
			page.url.searchParams.get('sort')?.startsWith(field)
		) ?? defaultOrderField
	);

	const orderDirection = $derived(
		Object.values(OrderDirection).find((dir) => page.url.searchParams.get('sort')?.endsWith(dir)) ??
			defaultOrderDirection
	);

	const filteredAndSortedFields = $derived(
		Object.values(orderField)
			.filter((field) => !onlyInclude || onlyInclude.includes(field as ValueOf<T>))
			.sort((a, b) => {
				const aWeight = orderFieldWeights[a as string] ?? 9999;
				const bWeight = orderFieldWeights[b as string] ?? 9999;
				return aWeight - bWeight;
			})
	);

	const fieldLabel = (fieldName: string) => {
		switch (fieldName) {
			case 'DEPLOYMENT_TIME':
				return 'Deploy';
			case 'VULNERABILITY_RISK_SCORE':
				return 'Risk score';
			case 'VULNERABILITY_LAST_SCANNED':
				return 'Last scanned';
			case 'HAS_SBOM':
				return 'Has SBOM';
			case 'VULNERABILITY_SEVERITY_CRITICAL':
				return 'Critical vulnerabilities';
			case 'VULNERABILITY_SEVERITY_HIGH':
				return 'High vulnerabilities';
			case 'VULNERABILITY_SEVERITY_MEDIUM':
				return 'Medium vulnerabilities';
			case 'VULNERABILITY_SEVERITY_LOW':
				return 'Low vulnerabilities';
			case 'VULNERABILITY_SEVERITY_UNASSIGNED':
				return 'Unassigned vulnerabilities';
			case 'RISK_SCORE':
				return 'Risk score';
			case 'HIGH_VULNERABILITIES':
				return 'High vulnerabilities';
			case 'CRITICAL_VULNERABILITIES':
				return 'Critical vulnerabilities';
			case 'MEDIUM_VULNERABILITIES':
				return 'Medium vulnerabilities';
			case 'LOW_VULNERABILITIES':
				return 'Low vulnerabilities';
			case 'UNASSIGNED_VULNERABILITIES':
				return 'Unassigned vulnerabilities';
			case 'SBOM_COVERAGE':
				return 'SBOM coverage';
			case 'SLUG':
				return 'Team';
			case 'ACCUMULATED_COST':
				return 'Accumulated cost';
			case 'LAST_MODIFIED_AT':
				return 'Last modified';
			case 'ISSUE_TYPE':
				return 'Issue type';
			case 'SEVERITY':
				return 'Severity';
			case 'RESOURCE_NAME':
				return 'Resource name';
			case 'RESOURCE_TYPE':
				return 'Resource type';
			case 'CPU_UTILIZATION':
				return 'CPU Utilization';
			case 'DISK_UTILIZATION':
				return 'Disk Utilization';
			case 'MEMORY_UTILIZATION':
				return 'Memory Utilization';
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
			<div style="display: flex; align-items: center; gap: var(--ax-space-8);">
				{#if orderDirection === OrderDirection.ASC}
					<SortUpIcon />
				{:else}
					<SortDownIcon />
				{/if}
				{fieldLabel(currentOrderField)}
			</div>
		</Button>
	{/snippet}
	{#key orderField}
		<ActionMenuRadioGroup value={currentOrderField} label="Order by">
			{#each filteredAndSortedFields as field (field)}
				<ActionMenuRadioItem
					value={field}
					onselect={(value) =>
						changeParams(
							{ sort: `${value}-${orderDirection}`, after: '', before: '' },
							{ noScroll: true }
						)}
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
					onselect={(value) =>
						changeParams(
							{ sort: `${currentOrderField}-${value}`, after: '', before: '' },
							{ noScroll: true }
						)}
				>
					{#if direction === OrderDirection.ASC}
						<SortUpIcon /> Ascending
					{:else}
						<SortDownIcon /> Descending
					{/if}
				</ActionMenuRadioItem>
			{/each}
		</ActionMenuRadioGroup>
	{/key}
</ActionMenu>
