<script lang="ts">
	import { page } from '$app/state';
	import { ActivityLogActivityType, ConfigOrderField, OrderDirection } from '$houdini';
	import { docURL } from '$lib/doc';
	import TeamActivityCard from '$lib/domain/activity/TeamActivityCard.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
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
	import { FileTextIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
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

	const allUsages = ['inUse', 'notInUse'];
	let activeUsages: string[] = $derived.by(() => {
		const param = page.url.searchParams.get('filter');
		if (param === 'inUse') return ['inUse'];
		if (param === 'notInUse') return ['notInUse'];
		return allUsages;
	});

	const toggleUsage = (key: string) => {
		const next = activeUsages.includes(key)
			? activeUsages.filter((s) => s !== key)
			: [...activeUsages, key];
		if (next.length === 0) return;
		const filter = next.length === allUsages.length ? '' : next[0];
		changeParams({ filter, after: '', before: '' });
	};

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after,
			nameFilter: params.newFilter ?? filter
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

	const environments = $derived.by(() => {
		return (
			$Configs.data?.team.environments
				.map((env) => {
					return {
						name: env.environment.name,
						configs:
							$Configs.data?.team.configs.nodes
								.filter((node) => node.teamEnvironment.environment.name === env.environment.name)
								.map((node) => {
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
				{/snippet}
				{#if configs.nodes.length > 0}
					{#each configs.nodes as config (config.id)}
						<ListItem interactive>
							<div class="name-group">
								<FileTextIcon style="font-size: 1.25rem; flex-shrink: 0" />
								<a
									href="/team/{teamSlug}/{config.teamEnvironment.environment
										.name}/config/{config.name}"
									class="item-name">{config.name}</a
								>
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
					{/each}
				{:else}
					<ListItem>
						<p>
							No configs found. Configs are used to store configuration data for your applications.
							<ExternalLink href={docURL('/services/config')}
								>Learn more about configs in Nais and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/if}
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
		<div class="layout-sidebar" style="gap: var(--ax-space-16)">
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
					<details class="usage-section" open>
						<summary class="usage-heading">Usage</summary>
						<div class="facet-list">
							<label class="facet-item">
								<input
									type="checkbox"
									checked={activeUsages.includes('inUse')}
									onchange={() => toggleUsage('inUse')}
								/>
								<span class="facet-label">In use</span>
							</label>
							<label class="facet-item">
								<input
									type="checkbox"
									checked={activeUsages.includes('notInUse')}
									onchange={() => toggleUsage('notInUse')}
								/>
								<span class="facet-label">Not in use</span>
							</label>
						</div>
					</details>
				</ListFilters>
			</SurfaceCard>
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
		</div>
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

	.usage-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.usage-heading {
		font-size: var(--ax-font-size-small);
		font-weight: 500;
		color: var(--ax-text-neutral-subtle);
		letter-spacing: 0.01em;
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
		padding-bottom: var(--ax-space-6);
		cursor: pointer;
		list-style: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.usage-heading::-webkit-details-marker {
		display: none;
	}

	.usage-heading::after {
		content: '';
		width: 0.4em;
		height: 0.4em;
		border-right: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: rotate(45deg);
		transition: transform 150ms ease;
		flex-shrink: 0;
	}

	.usage-section[open] > .usage-heading::after {
		transform: rotate(-135deg);
	}

	.facet-list {
		display: flex;
		flex-direction: column;
	}

	.facet-item {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-6) 0;
		font-size: var(--ax-font-size-medium);
		cursor: pointer;
	}

	.facet-item:hover {
		color: var(--ax-text-neutral);
	}

	.facet-item input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		margin: 0;
		flex-shrink: 0;
		cursor: pointer;
		accent-color: var(--ax-text-accent);
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
	.item-name:hover {
		text-decoration: underline;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.right {
			align-items: flex-end;
			margin-top: var(--ax-space-6);
		}
	}
</style>
