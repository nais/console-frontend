<script lang="ts">
	import { page } from '$app/state';
	import { ApplicationOrderField, OrderDirection } from '$houdini';
	import AggregatedCostForApplications from '$lib/domain/cost/AggregatedCostForApplications.svelte';
	import AppListItem from '$lib/domain/list-items/AppListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SearchField from '$lib/ui/SearchField.svelte';
	import StatusFilterPills from '$lib/ui/StatusFilterPills.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Button } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Applications, ApplicationsListMetadata, teamSlug } = $derived(data);

	let filter = $state($Applications.variables?.filter?.name ?? '');

	let after: string = $derived($Applications.variables?.after ?? '');
	let before: string = $derived($Applications.variables?.before ?? '');

	const totalApplications = $derived(
		$ApplicationsListMetadata.data?.team.totalApplications.pageInfo.totalCount ?? 0
	);

	const allEnvs = $derived(
		$ApplicationsListMetadata.data?.team.environments.map((env) => env.environment.name) ?? []
	);

	let filteredEnvs = $derived(page.url.searchParams.get('environments')?.split(',') ?? allEnvs);

	const allStates = ['running', 'not-running', 'unknown'];
	let activeStatuses = $derived(page.url.searchParams.get('states')?.split(',') ?? allStates);

	let states = $derived({
		running: $ApplicationsListMetadata.data?.team.inventoryCounts?.applications?.running ?? 0,
		notRunning: $ApplicationsListMetadata.data?.team.inventoryCounts?.applications?.notRunning ?? 0,
		unknown: $ApplicationsListMetadata.data?.team.inventoryCounts?.applications?.unknown ?? 0
	});

	$effect(() => {
		const environments = filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');

		if (environments !== (page.url.searchParams.get('environments') ?? '')) {
			changeQuery({ environments });
		}
	});

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
			environments?: string;
			states?: string;
		} = {}
	) => {
		const currentEnvironments =
			filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');
		const currentStates =
			activeStatuses.length === allStates.length ? '' : activeStatuses.join(',');
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after,
			filter: params.newFilter ?? filter,
			environments: params.environments ?? currentEnvironments,
			states: params.states ?? currentStates
		});
	};
</script>

<GraphErrors errors={$Applications.errors} />

<div class="wrapper">
	<div>
		{#if totalApplications > 0}
			{@const apps = $Applications.data?.team.applications}

			<List title="Apps" count={apps?.pageInfo.totalCount ?? 0}>
				{#snippet search()}
					<SearchField
						value={filter}
						placeholder="Search apps..."
						label="Search applications"
						oninput={(v) => (filter = v)}
						onsubmit={() => changeQuery({ newFilter: filter })}
						onclear={() => {
							filter = '';
							changeQuery({ newFilter: '' });
						}}
					/>
				{/snippet}
				{#snippet filters()}
					<StatusFilterPills
						running={states.running}
						notRunning={states.notRunning}
						unknown={states.unknown}
						{activeStatuses}
						onchange={(s) => {
							const statesValue = s.length === allStates.length ? '' : s.join(',');
							changeQuery({ states: statesValue, after: '', before: '' });
						}}
					/>
				{/snippet}
				{#snippet menu()}
					<ActionMenu>
						{#snippet trigger(props)}
							<Button
								variant="tertiary-neutral"
								size="small"
								iconPosition="right"
								{...props}
								icon={ChevronDownIcon}
							>
								<span style="font-weight: normal">Environment</span>
							</Button>
						{/snippet}
						<ActionMenuCheckboxItem
							checked={$ApplicationsListMetadata.data?.team.environments.every((env) =>
								filteredEnvs.includes(env.environment.name)
							)
								? true
								: filteredEnvs.length > 0
									? 'indeterminate'
									: false}
							onchange={(checked) => (filteredEnvs = checked ? allEnvs : [])}
						>
							All environments
						</ActionMenuCheckboxItem>
						{#each $ApplicationsListMetadata.data?.team.environments ?? [] as { environment, id } (id)}
							<ActionMenuCheckboxItem
								checked={filteredEnvs.includes(environment.name)}
								onchange={(checked) =>
									(filteredEnvs = checked
										? [...filteredEnvs, environment.name]
										: filteredEnvs.filter((env) => env !== environment.name))}
							>
								{environment.name}
							</ActionMenuCheckboxItem>
						{/each}
					</ActionMenu>
					<OrderByMenu
						orderField={ApplicationOrderField}
						defaultOrderField={ApplicationOrderField.ISSUES}
						defaultOrderDirection={OrderDirection.DESC}
					/>
				{/snippet}
				{#each apps?.nodes ?? [] as app (app.id)}
					<AppListItem {app} />
				{/each}
			</List>
			<Pagination
				page={apps?.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({ before: apps?.pageInfo.startCursor ?? '', after: '' });
					},
					loadNextPage: () => {
						changeQuery({ after: apps?.pageInfo.endCursor ?? '', before: '' });
					}
				}}
			/>
		{:else}
			<BodyLong><strong>No applications found.</strong></BodyLong>
		{/if}
	</div>
	<div class="right-column">
		{#if totalApplications > 0}
			<SurfaceCard title="Cost">
				<AggregatedCostForApplications {teamSlug} totalCount={totalApplications} />
			</SurfaceCard>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 300px;
		gap: var(--spacing-layout);
	}

	.right-column {
		display: grid;
		gap: var(--ax-space-24);
		align-content: start;
	}

	/* Mobile responsive layout */
	@media (max-width: 767px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}
	}

	/* Landscape on mobile phones: keep single column despite wider viewport */
	@media (max-height: 500px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}
	}
</style>
