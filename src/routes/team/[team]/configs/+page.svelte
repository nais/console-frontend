<script lang="ts">
	import { page } from '$app/state';
	import { ActivityLogActivityType, ConfigOrderField, OrderDirection } from '$houdini';
	import { docURL } from '$lib/doc';
	import TeamActivityCard from '$lib/domain/activity/TeamActivityCard.svelte';
	import LabelFacets from '$lib/domain/labels/LabelFacets.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import CollapsibleSidebar from '$lib/ui/CollapsibleSidebar.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { getConfigPermissions } from '$lib/utils/configPermissions';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Detail, Tag } from '@nais/ds-svelte-community';
	import { FileTextIcon, FunnelIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
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

	const sortFields: { value: ConfigOrderFieldOptions; label: string }[] = [
		{ value: ConfigOrderField.NAME, label: 'Name' },
		{ value: ConfigOrderField.ENVIRONMENT, label: 'Environment' },
		{ value: ConfigOrderField.LAST_MODIFIED_AT, label: 'Last modified' }
	];

	const currentSortField: ConfigOrderFieldOptions = $derived(
		(Object.values(ConfigOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as ConfigOrderFieldOptions | undefined) ?? ConfigOrderField.NAME
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function setSort(field: ConfigOrderFieldOptions) {
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
	{@const configs = $Configs.data.team.configs}
	<div class="layout-two-column">
		<div>
			<List title="Configs" count={configs.pageInfo.totalCount}>
				{#snippet actions()}
					{#if canMutate}
						<Button variant="secondary" size="small" onclick={() => open()} icon={PlusIcon}>
							Create Config
						</Button>
					{/if}
					<button class="sidebar-toggle" onclick={() => (filtersOpen = !filtersOpen)}>
						<FunnelIcon aria-hidden="true" style="font-size: 1rem" />
						Filters
					</button>
				{/snippet}
				{#each configs.edges as { node: config } (config.id)}
					<ListItem
						interactive
						href="/team/{teamSlug}/{config.teamEnvironment.environment.name}/config/{config.name}"
					>
						<div class="name-group">
							<FileTextIcon style="font-size: 1.25rem; flex-shrink: 0" />
							<span class="item-name">{config.name}</span>
							<Tag size="xsmall" variant={envTagVariant(config.teamEnvironment.environment.name)}
								>{config.teamEnvironment.environment.name}</Tag
							>
						</div>
						<div class="right">
							{#if config.workloads.pageInfo.totalCount > 0}
								<Detail
									>Config is in use by {config.workloads.pageInfo.totalCount} workload{config
										.workloads.pageInfo.totalCount > 1
										? 's'
										: ''}</Detail
								>
							{:else}
								<Detail>Config is not in use</Detail>
							{/if}
							<Detail
								>Last modified:
								{#if config.lastModifiedAt}
									<Time time={config.lastModifiedAt} distance />
								{:else}
									<code>n/a</code>
								{/if}
							</Detail>
						</div>
					</ListItem>
				{:else}
					<ListItem>
						<p>
							No configs found. Configs are used to store configuration data for your applications.
							<ExternalLink href={docURL('/services/config')}
								>Learn more about configs in Nais and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/each}
			</List>
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
					{sortFields}
					{currentSortField}
					{currentSortDirection}
					onFilterInput={(v) => (filter = v)}
					onFilterSubmit={() => changeQuery({ newFilter: filter })}
					onFilterClear={() => {
						filter = '';
						changeQuery({ newFilter: '' });
					}}
					onSort={(field) => setSort(field as ConfigOrderFieldOptions)}
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
									{@const count = inUseFacets.find((f) => String(f.value) === value)?.count ?? 0}
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

<style>
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2);
	}

	.name-group {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		min-width: 0;
	}
	.name-group :global(.aksel-tag) {
		white-space: nowrap;
		flex-shrink: 0;
	}
	.item-name {
		color: var(--ax-text-neutral);
		text-decoration: none;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		flex: 0 1 auto;
	}

	@container (max-width: 500px) {
		.right {
			align-items: flex-start;
			margin-top: var(--ax-space-6);
		}
	}

	@media (max-width: 767px), (max-height: 500px) {
		.right {
			align-items: flex-end;
			margin-top: var(--ax-space-6);
		}
	}
</style>
