<script lang="ts">
	import { page } from '$app/state';
	import { OrderDirection, PostgresInstanceOrderField } from '$houdini';
	import { docURL } from '$lib/doc';
	import WorkloadListFilters from '$lib/domain/workload/WorkloadListFilters.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { changeParams } from '$lib/utils/searchparams';
	import { Alert, Loader, Tag } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	type PostgresOrderFieldOptions =
		(typeof PostgresInstanceOrderField)[keyof typeof PostgresInstanceOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();

	let { PostgresInstances } = $derived(data);

	const sortFields: { value: PostgresOrderFieldOptions; label: string }[] = [
		{ value: PostgresInstanceOrderField.NAME, label: 'Name' },
		{ value: PostgresInstanceOrderField.ENVIRONMENT, label: 'Environment' }
	];

	const currentSortField: PostgresOrderFieldOptions = $derived(
		(Object.values(PostgresInstanceOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as PostgresOrderFieldOptions | undefined) ?? PostgresInstanceOrderField.NAME
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function setSort(field: PostgresOrderFieldOptions) {
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: OrderDirection.ASC;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' });
	}
	let hasCloudSql = $derived(
		($PostgresInstances.data?.team.inventoryCounts.sqlInstances.total ?? 0) > 0
	);
	let cloudSqlTeamSlug = $derived($PostgresInstances.data?.team.slug ?? data.teamSlug);

	const selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);
	const selectedStates: string[] = $derived(
		page.url.searchParams.get('states')?.split(',').filter(Boolean) ?? []
	);
	const selectedMajorVersions: string[] = $derived(
		page.url.searchParams.get('majorVersions')?.split(',').filter(Boolean) ?? []
	);
	const selectedHighAvailability: string = $derived(
		page.url.searchParams.get('highAvailability') ?? ''
	);
	let selectedLabels: string[] = $derived(
		page.url.searchParams.get('labels')?.split(',').filter(Boolean) ?? []
	);

	function handleEnvironmentsChange(selected: string[]) {
		changeParams({ environments: selected.join(','), after: '', before: '' }, { noScroll: true });
	}
	function handleStatesChange(selected: string[]) {
		changeParams({ states: selected.join(','), after: '', before: '' }, { noScroll: true });
	}

	function handleLabelsChange(selected: string[]) {
		changeParams({ labels: selected.join(','), after: '', before: '' }, { noScroll: true });
	}

	const majorVersionFacets = $derived(
		$PostgresInstances.data?.team.postgresInstances.facets?.majorVersions ?? []
	);
	const displayMajorVersionFacets = $derived([
		...majorVersionFacets,
		...selectedMajorVersions
			.filter((v) => !majorVersionFacets.some((f) => f.value === v))
			.map((v) => ({ value: v, count: 0 }))
	]);

	function toggleMajorVersion(version: string) {
		const isSelected = selectedMajorVersions.includes(version);
		const next = isSelected
			? selectedMajorVersions.filter((v) => v !== version)
			: [...selectedMajorVersions, version];
		changeParams({ majorVersions: next.join(','), after: '', before: '' }, { noScroll: true });
	}

	const highAvailabilityFacets = $derived(
		$PostgresInstances.data?.team.postgresInstances.facets?.highAvailability ?? []
	);

	function toggleHighAvailability(value: string) {
		const next = selectedHighAvailability === value ? '' : value;
		changeParams({ highAvailability: next, after: '', before: '' }, { noScroll: true });
	}
</script>

<GraphErrors errors={$PostgresInstances.errors} />

{#snippet cloudSqlRelocationAlert()}
	{#if hasCloudSql}
		<Alert variant="info" size="small" style="margin-bottom: 1rem;">
			Postgres instances running in Cloud SQL have moved to a new page. You can find them on
			<a href="/team/{cloudSqlTeamSlug}/cloudsql">Cloud SQL</a>.
		</Alert>
	{/if}
{/snippet}

{#if $PostgresInstances.fetching}
	<div class="loading" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if $PostgresInstances.data}
	{@const si = $PostgresInstances.data.team.postgresInstances}

	<div class="layout-two-column">
		<div>
			{@render cloudSqlRelocationAlert()}

			<List title="Postgres" count={si.pageInfo.totalCount}>
				{#if si.nodes.length > 0}
					{#each si.nodes as instance (instance.id)}
						<ListItem interactive>
							<div class="name-group">
								<TooltipAlignHack
									content={{
										DEGRADED: 'DEGRADED',
										PROGRESSING: 'PROGRESSING',
										AVAILABLE: 'AVAILABLE'
									}[instance.state] ?? ''}
								>
									<CircleFillIcon
										style="color: var({{
											AVAILABLE: '--ax-bg-success-strong',
											DEGRADED: '--ax-bg-danger-strong',
											PROGRESSING: '--ax-bg-warning-moderate-pressed'
										}[instance.state] ?? '--ax-bg-info-strong'}); font-size: 0.7rem"
									/>
								</TooltipAlignHack>
								<a
									href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
										.name}/postgres/{instance.name}"
									class="item-name">{instance.name}</a
								>
								<Tag
									size="xsmall"
									variant={envTagVariant(instance.teamEnvironment.environment.name)}
									>{instance.teamEnvironment.environment.name}</Tag
								>
							</div>

							<div class="right">
								<div>Version: <code>{instance.majorVersion}</code></div>
							</div>
						</ListItem>
					{/each}
				{:else}
					<ListItem>
						<p>
							No Postgres instances found. Postgres instances provide managed relational databases
							in the cloud.
							<ExternalLink href={docURL('/persistence/postgresql')}
								>Learn more about Postgres in Nais and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/if}
			</List>

			<Pagination
				page={si.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeParams({ after: '', before: si.pageInfo.startCursor ?? '' }, { noScroll: true }),
					loadNextPage: () =>
						changeParams({ before: '', after: si.pageInfo.endCursor ?? '' }, { noScroll: true })
				}}
			/>
		</div>
		<div class="layout-sidebar">
			<SurfaceCard title="Filters">
				<WorkloadListFilters
					{sortFields}
					{currentSortField}
					{currentSortDirection}
					states={$PostgresInstances.data?.team.postgresInstances.facets?.states ?? []}
					{selectedStates}
					environments={$PostgresInstances.data?.team.postgresInstances.facets?.environments ?? []}
					labels={$PostgresInstances.data?.team.postgresInstances.facets?.labels ?? []}
					{selectedEnvironments}
					{selectedLabels}
					onSort={(field) => setSort(field as PostgresOrderFieldOptions)}
					onStatesChange={handleStatesChange}
					onEnvironmentsChange={handleEnvironmentsChange}
					onLabelsChange={handleLabelsChange}
				>
					{#if displayMajorVersionFacets.length > 0}
						<details class="filter-section" open>
							<summary class="section-heading">Major version</summary>
							<div class="facet-list">
								{#each displayMajorVersionFacets as facet (facet.value)}
									<label class="facet-item">
										<input
											type="checkbox"
											checked={selectedMajorVersions.includes(facet.value)}
											onchange={() => toggleMajorVersion(facet.value)}
										/>
										<span class="facet-label">{facet.value}</span>
										<span class="facet-count">{facet.count}</span>
									</label>
								{/each}
							</div>
						</details>
					{/if}
					{#if highAvailabilityFacets.length > 0 || selectedHighAvailability !== ''}
						<details class="filter-section" open>
							<summary class="section-heading">High availability</summary>
							<div class="facet-list">
								{#each [true, false] as haValue (String(haValue))}
									{@const count =
										highAvailabilityFacets.find((f) => f.value === haValue)?.count ?? 0}
									<label class="facet-item">
										<input
											type="checkbox"
											checked={selectedHighAvailability === String(haValue)}
											onchange={() => toggleHighAvailability(String(haValue))}
										/>
										<span class="facet-label"
											>{capitalizeFirstLetter(haValue ? 'high availability' : 'standard')}</span
										>
										<span class="facet-count">{count}</span>
									</label>
								{/each}
							</div>
						</details>
					{/if}
				</WorkloadListFilters>
			</SurfaceCard>
		</div>
	</div>
{/if}

<style>
	.right {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-6);
		align-items: flex-end;
	}

	code {
		font-size: 0.9rem;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
		width: 100%;
	}

	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.right {
			align-items: flex-end;
			margin-top: var(--ax-space-6);
		}
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
</style>
