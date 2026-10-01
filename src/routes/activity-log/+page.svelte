<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { type ActivityLogActivityType$options } from '$houdini';
	import ActivityLogFacets from '#lib/domain/activity/ActivityLogFacets.svelte';
	import ActivityLogItem from '#lib/domain/list-items/ActivityLogListItem.svelte';
	import CollapsibleSidebar from '#lib/ui/CollapsibleSidebar.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import List from '#lib/ui/List.svelte';
	import ListFilters from '#lib/ui/ListFilters.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { BodyShort, TextField, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import { FunnelIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import { parseOslo } from './osloTime';

	let { data }: PageProps = $props();
	let filtersOpen = $state(false);
	let { TenantActivityLog } = $derived(data);
	let fromInput = $derived(data.dateRange.fromInput);
	let toInput = $derived(data.dateRange.toInput);
	let customRangePreview = $state(false);
	let customRangeOpen = $derived(data.dateRange.custom || customRangePreview);

	afterNavigate(() => {
		customRangePreview = false;
	});

	let selectedActivityTypes: ActivityLogActivityType$options[] = $derived(
		(page.url.searchParams.get('activityTypes')?.split(',').filter(Boolean) ??
			[]) as ActivityLogActivityType$options[]
	);

	let selectedResourceTypes: string[] = $derived(
		page.url.searchParams.get('resourceTypes')?.split(',').filter(Boolean) ?? []
	);

	let selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);

	function handleActivityTypesChange(selected: ActivityLogActivityType$options[]) {
		changeParams(
			{
				activityTypes: selected.join(','),
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	}

	function handleResourceTypesChange(selected: string[]) {
		changeParams(
			{
				resourceTypes: selected.join(','),
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	}

	function handleEnvironmentsChange(selected: string[]) {
		changeParams(
			{
				environments: selected.join(','),
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	}

	function handleTimeRangeChange(value: string) {
		if (value === 'custom') {
			customRangePreview = true;
		} else if (value === 'last7') {
			customRangePreview = false;
			if (data.dateRange.custom) {
				changeParams({ from: '', to: '', after: '', before: '' }, { noScroll: true });
			}
		}
	}

	function handleDateChange(event: Event, bound: 'from' | 'to') {
		const input = event.currentTarget as HTMLInputElement;
		const selected = input.value.length === 16 ? `${input.value}:00` : input.value;
		if (
			!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(selected) ||
			Number.isNaN(Date.parse(`${selected}Z`)) ||
			new Date(`${selected}Z`).toISOString().slice(0, 19) !== selected
		) {
			input.setCustomValidity('Enter a valid local date and time.');
			input.reportValidity();
			return;
		}
		input.setCustomValidity('');
		if (!input.checkValidity()) {
			input.reportValidity();
			return;
		}

		let from = bound === 'from' ? selected : fromInput;
		let to = bound === 'to' ? selected : toInput;
		if (bound === 'from') {
			const latestDay = new Date(
				Date.parse(`${from}Z`) + (data.dateRange.maxDays - 1) * 86_400_000
			);
			const latestTo = `${latestDay.toISOString().slice(0, 10)}T23:59:59`;
			to = to < from ? from : to > latestTo ? latestTo : to;
		} else {
			const earliestDay = new Date(
				Date.parse(`${to}Z`) - (data.dateRange.maxDays - 1) * 86_400_000
			);
			const earliestFrom = `${earliestDay.toISOString().slice(0, 10)}T00:00:00`;
			from = from > to ? to : from < earliestFrom ? earliestFrom : from;
		}
		let fromTime: Date;
		let toTime: Date;
		try {
			fromTime = from === fromInput ? new Date(data.dateRange.from) : parseOslo(from);
			toTime = to === toInput ? new Date(data.dateRange.to) : parseOslo(to);
		} catch (error) {
			if (!(error instanceof RangeError)) throw error;
			input.setCustomValidity(error.message);
			input.reportValidity();
			return;
		}
		changeParams(
			{
				from: fromTime.toISOString(),
				to: toTime.toISOString(),
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	}
</script>

<div class="page">
	<div class="container">
		<GraphErrors errors={$TenantActivityLog.errors} />
		{#if $TenantActivityLog.data}
			{const ae = $derived($TenantActivityLog.data.activityLog)}
			<div class="layout-two-column">
				<div>
					<List title="Activity Log" count={ae.pageInfo.totalCount}>
						{#snippet actions()}
							{#if ae.facets}
								<button
									type="button"
									class="sidebar-toggle"
									aria-expanded={filtersOpen}
									onclick={() => (filtersOpen = !filtersOpen)}
								>
									<FunnelIcon aria-hidden="true" style="font-size: 1rem" />
									Filters
								</button>
							{/if}
						{/snippet}
						{#each ae.edges || [] as { node: item }, i ((item.__typename, i))}
							<ActivityLogItem {item} mode="full" showTeam />
						{:else}
							<ListItem>
								<span class="empty-state">No activity log entries found</span>
							</ListItem>
						{/each}
					</List>
					{#if ae.pageInfo.hasPreviousPage || ae.pageInfo.hasNextPage}
						<Pagination
							page={ae.pageInfo}
							loaders={{
								loadPreviousPage: () => {
									changeParams(
										{
											after: '',
											before: ae.pageInfo.startCursor ?? ''
										},
										{ noScroll: true }
									);
								},
								loadNextPage: () => {
									changeParams(
										{
											before: '',
											after: ae.pageInfo.endCursor ?? ''
										},
										{ noScroll: true }
									);
								}
							}}
						/>
					{/if}
				</div>

				{#if ae.facets}
					<CollapsibleSidebar bind:open={filtersOpen}>
						<SurfaceCard title="Filters">
							<ListFilters>
								<ToggleGroup
									label="Time range"
									size="small"
									value={customRangeOpen ? 'custom' : 'last7'}
									onchange={handleTimeRangeChange}
								>
									<ToggleGroupItem value="last7">Last 7 days</ToggleGroupItem>
									<ToggleGroupItem value="custom">Custom</ToggleGroupItem>
								</ToggleGroup>
								{#if customRangeOpen}
									<div class="date-range" role="group" aria-label="Custom date and time range">
										<TextField
											type="datetime-local"
											step={1}
											size="small"
											label="From"
											value={fromInput}
											max={fromInput > data.dateRange.todayEnd
												? fromInput
												: data.dateRange.todayEnd}
											onchange={(event) => handleDateChange(event, 'from')}
										/>
										<TextField
											type="datetime-local"
											step={1}
											size="small"
											label="To"
											value={toInput}
											max={toInput > data.dateRange.todayEnd ? toInput : data.dateRange.todayEnd}
											onchange={(event) => handleDateChange(event, 'to')}
										/>
										<BodyShort size="small" textColor="subtle">
											Oslo time. Up to {data.dateRange.maxDays} days.
										</BodyShort>
									</div>
								{/if}
								<ActivityLogFacets
									activityTypes={ae.facets.activityTypes}
									resourceTypes={ae.facets.resourceTypes}
									environments={ae.facets.environments}
									{selectedActivityTypes}
									{selectedResourceTypes}
									{selectedEnvironments}
									onActivityTypesChange={handleActivityTypesChange}
									onResourceTypesChange={handleResourceTypesChange}
									onEnvironmentsChange={handleEnvironmentsChange}
								/>
							</ListFilters>
						</SurfaceCard>
					</CollapsibleSidebar>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.date-range {
		display: grid;
		gap: var(--ax-space-8);
	}

	.empty-state {
		color: var(--ax-text-neutral-subtle);
	}

	@media (max-width: 767px) {
		.container {
			gap: var(--ax-space-16);
		}
	}
</style>
