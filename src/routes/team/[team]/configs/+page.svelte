<script lang="ts">
	import { page } from '$app/state';
	import { ActivityLogActivityType, ConfigOrderField, OrderDirection } from '$houdini';
	import { docURL } from '#lib/doc.js';
	import TeamActivityCard from '#lib/domain/activity/TeamActivityCard.svelte';
	import LabelFacets from '#lib/domain/labels/LabelFacets.svelte';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import CollapsibleSidebar from '#lib/ui/CollapsibleSidebar.svelte';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import ListFilters from '#lib/ui/ListFilters.svelte';
	import ResourceTable from '#lib/ui/ResourceTable.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { getConfigPermissions } from '#lib/utils/configPermissions.js';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { Button, Tag, Td, Th, Tr, type TableSortState } from '#lib/shadcn/ui/index.js';
	import { FileTextIcon, FunnelIcon, PlusIcon } from '#lib/icons/index.js';
	import type { PageProps } from './$types';
	import CreateConfig, { type EnvironmentType } from './CreateConfig.svelte';

	type ConfigOrderFieldOptions = (typeof ConfigOrderField)[keyof typeof ConfigOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();
	let { Configs, teamSlug } = $derived(data);
	let viewerIsMember = $derived($Configs.data?.team.viewerIsMember ?? false);
	let isAdmin = $derived(
		$Configs.data?.me?.__typename === 'User' ? $Configs.data.me.isAdmin : false
	);
	let permissions = $derived(getConfigPermissions(viewerIsMember, isAdmin));
	let canMutate = $derived(permissions.canMutate);

	let filter = $state(page.url.searchParams.get('nameFilter') ?? '');

	let after: string = $derived($Configs.variables?.after ?? '');
	let before: string = $derived($Configs.variables?.before ?? '');

	const inUseFilter = $derived(page.url.searchParams.get('inUse'));
	const selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);
	let selectedLabels: string[] = $derived(
		page.url.searchParams.get('labels')?.split(',').filter(Boolean) ?? []
	);

	const inUseFacets = $derived($Configs.data?.team.configs.facets?.inUse ?? []);
	const environmentFacets = $derived($Configs.data?.team.configs.facets?.environments ?? []);
	const displayEnvironmentFacets = $derived([
		...environmentFacets,
		...selectedEnvironments
			.filter((e) => !environmentFacets.some((f) => f.value === e))
			.map((e) => ({ value: e, count: 0 }))
	]);

	function toggleInUse(value: string) {
		const next = inUseFilter === value ? '' : value;
		changeParams({ inUse: next, after: '', before: '' }, { noScroll: true });
	}

	function toggleEnvironment(env: string) {
		const isSelected = selectedEnvironments.includes(env);
		const next = isSelected
			? selectedEnvironments.filter((e) => e !== env)
			: [...selectedEnvironments, env];
		changeParams({ environments: next.join(','), after: '', before: '' }, { noScroll: true });
	}

	function handleLabelsChange(selected: string[]) {
		changeQuery({
			labels: selected.join(','),
			after: '',
			before: ''
		});
	}

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
			labels?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after,
			nameFilter: params.newFilter ?? filter,
			environments: selectedEnvironments.join(','),
			labels: params.labels ?? (selectedLabels.join(',') || '')
		});
	};

	const currentSortField: ConfigOrderFieldOptions = $derived(
		(Object.values(ConfigOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as ConfigOrderFieldOptions | undefined) ?? ConfigOrderField.NAME
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			OrderDirectionOptions | undefined) ?? OrderDirection.ASC
	);

	const tableSort: TableSortState = $derived({
		orderBy: currentSortField,
		direction: currentSortDirection === OrderDirection.ASC ? 'ascending' : 'descending'
	});

	function setSort(key: string) {
		const field = Object.values(ConfigOrderField).find((field) => field === key);
		if (!field) throw new Error(`Unsupported config sort field: ${key}`);
		const defaultDirection =
			field === ConfigOrderField.NAME || field === ConfigOrderField.ENVIRONMENT
				? OrderDirection.ASC
				: OrderDirection.DESC;
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: defaultDirection;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' });
	}

	let createConfigOpen = $state(false);
	let filtersOpen = $state(false);

	const environments = $derived.by(() => {
		return (
			$Configs.data?.team.environments
				.map((env) => {
					return {
						name: env.environment.name,
						configs:
							$Configs.data?.team.configs.edges
								.filter(
									({ node }) => node.teamEnvironment.environment.name === env.environment.name
								)
								.map(({ node }) => {
									return {
										name: node.name,
										lastModifiedAt: node.lastModifiedAt ? new Date(node.lastModifiedAt) : null
									};
								}) || []
					};
				})
				.filter((env) => env !== undefined) ?? ([] as EnvironmentType[])
		);
	});

	const open = () => {
		createConfigOpen = true;
	};
</script>

{#if $Configs.errors}
	<GraphErrors errors={$Configs.errors} />
{:else if $Configs.data}
	{const configs = $derived($Configs.data.team.configs)}
	<div class="layout-two-column">
		<div>
			<Collection
				title="Configs"
				icon={FileTextIcon}
				headerBorder={false}
				count={configs.pageInfo.totalCount}
			>
				{#snippet actions()}
					{#if canMutate}
						<Button variant="secondary" size="small" onclick={() => open()} icon={PlusIcon}>
							Create Config
						</Button>
					{/if}
					<button
						type="button"
						class="sidebar-toggle"
						aria-expanded={filtersOpen}
						onclick={() => (filtersOpen = !filtersOpen)}
					>
						<FunnelIcon aria-hidden="true" style="font-size: 1rem" />
						Filters
					</button>
				{/snippet}
				{#if configs.pageInfo.totalCount > 0}
					<ResourceTable label="Configs" sort={tableSort} onsortchange={setSort}>
						{#snippet header()}
							<Th sortable sortKey={ConfigOrderField.NAME}>Name</Th>
							<Th sortable sortKey={ConfigOrderField.ENVIRONMENT}>Env</Th>
							<Th>Usage</Th>
							<Th sortable sortKey={ConfigOrderField.LAST_MODIFIED_AT}>Last modified</Th>
						{/snippet}
						{#each configs.edges as { node: config } (config.id)}
							<Tr>
								<Td>
									<a
										class="resource-name"
										href="/team/{teamSlug}/{config.teamEnvironment.environment
											.name}/config/{config.name}">{config.name}</a
									>
								</Td>
								<Td>
									<Tag
										size="xsmall"
										variant={envTagVariant(config.teamEnvironment.environment.name)}
										>{config.teamEnvironment.environment.name}</Tag
									>
								</Td>
								<Td>
									{#if config.workloads.pageInfo.totalCount > 0}
										<span class="table-meta"
											>In use by {config.workloads.pageInfo.totalCount} workload{config.workloads
												.pageInfo.totalCount > 1
												? 's'
												: ''}</span
										>
									{:else}
										<span class="table-meta">Not in use</span>
									{/if}
								</Td>
								<Td>
									<span class="table-meta">
										{#if config.lastModifiedAt}
											<Time time={config.lastModifiedAt} distance />
										{:else}
											<code>n/a</code>
										{/if}
									</span>
								</Td>
							</Tr>
						{/each}
					</ResourceTable>
				{:else}
					<p>
						No configs found. Configs are used to store configuration data for your applications.
						<ExternalLink href={docURL('/services/config')}
							>Learn more about configs in Nais and how to get started.</ExternalLink
						>
					</p>
				{/if}
			</Collection>
			<Pagination
				page={configs.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({ before: configs.pageInfo.startCursor ?? '', after: '' });
					},
					loadNextPage: () => {
						changeQuery({ after: configs.pageInfo.endCursor ?? '', before: '' });
					}
				}}
			/>
		</div>
		<CollapsibleSidebar bind:open={filtersOpen}>
			{#snippet extras()}
				<TeamActivityCard
					{teamSlug}
					viewAllHref="/team/{teamSlug}/activity-log"
					filter={{
						activityTypes: [
							ActivityLogActivityType.CONFIG_CREATED,
							ActivityLogActivityType.CONFIG_UPDATED,
							ActivityLogActivityType.CONFIG_DELETED
						]
					}}
				/>
			{/snippet}
			<SurfaceCard title="Filters">
				<ListFilters
					{filter}
					searchPlaceholder="Filter by name"
					searchLabel="Filter configs"
					onFilterInput={(v) => (filter = v)}
					onFilterSubmit={() => changeQuery({ newFilter: filter })}
					onFilterClear={() => {
						filter = '';
						changeQuery({ newFilter: '' });
					}}
				>
					{#if displayEnvironmentFacets.length > 0}
						<details class="filter-section" open>
							<summary class="section-heading">Environments</summary>
							<div class="facet-list">
								{#each displayEnvironmentFacets as facet (facet.value)}
									<label class="facet-item">
										<input
											type="checkbox"
											checked={selectedEnvironments.includes(facet.value)}
											onchange={() => toggleEnvironment(facet.value)}
										/>
										<span class="facet-label">{facet.value}</span>
										<span class="facet-count">{facet.count}</span>
									</label>
								{/each}
							</div>
						</details>
					{/if}
					{#if inUseFacets.length > 0 || inUseFilter !== null}
						<details class="filter-section" open>
							<summary class="section-heading">Usage</summary>
							<div class="facet-list">
								{#each ['true', 'false'] as value (value)}
									{const count = $derived(
										inUseFacets.find((f) => String(f.value) === value)?.count ?? 0
									)}
									<label class="facet-item">
										<input
											type="checkbox"
											checked={inUseFilter === value}
											onchange={() => toggleInUse(value)}
										/>
										<span class="facet-label">{value === 'true' ? 'In use' : 'Not in use'}</span>
										<span class="facet-count">{count}</span>
									</label>
								{/each}
							</div>
						</details>
					{/if}
					{#if ($Configs.data?.team.configs.facets?.labels ?? []).length > 0}
						<LabelFacets
							labels={$Configs.data?.team.configs.facets?.labels ?? []}
							{selectedLabels}
							onLabelsChange={handleLabelsChange}
						/>
					{/if}
				</ListFilters>
			</SurfaceCard>
		</CollapsibleSidebar>
	</div>
	{#if createConfigOpen}
		<CreateConfig team={teamSlug} bind:open={createConfigOpen} {environments} />
	{/if}
{/if}
