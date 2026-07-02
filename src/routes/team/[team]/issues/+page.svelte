<script lang="ts">
	import { page } from '$app/state';
	import { IssueOrderField, IssueType, OrderDirection } from '$houdini';
	import IssuesFacets from '$lib/domain/issues/IssuesFacets.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import CollapsibleSidebar from '$lib/ui/CollapsibleSidebar.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { FunnelIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamIssues, TeamIssuesMetadata } = $derived(data);

	let filtersOpen = $state(false);
	let issues = $derived($TeamIssues.data?.team.issues);

	let after: string = $derived($TeamIssues.variables?.after ?? '');
	let before: string = $derived($TeamIssues.variables?.before ?? '');

	const totalCount = $derived($TeamIssuesMetadata.data?.team.total.pageInfo.totalCount ?? 0);

	const allEnvironments = $derived($TeamIssuesMetadata.data?.team.environments ?? []);

	const severityFacets = $derived([
		{
			severity: 'CRITICAL',
			count: $TeamIssuesMetadata.data?.team.critical.pageInfo.totalCount ?? 0
		},
		{
			severity: 'WARNING',
			count: $TeamIssuesMetadata.data?.team.warnings.pageInfo.totalCount ?? 0
		},
		{ severity: 'TODO', count: $TeamIssuesMetadata.data?.team.todos.pageInfo.totalCount ?? 0 }
	]);

	const issueTypes = Object.values(IssueType) as string[];

	let selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);

	let selectedSeverity: string = $derived(page.url.searchParams.get('severity') ?? '');

	let selectedIssueType: string = $derived(page.url.searchParams.get('issueType') ?? '');

	type IssueOrderFieldOptions = (typeof IssueOrderField)[keyof typeof IssueOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	const sortFields: { value: IssueOrderFieldOptions; label: string }[] = [
		{ value: IssueOrderField.SEVERITY, label: 'Severity' },
		{ value: IssueOrderField.ISSUE_TYPE, label: 'Issue type' },
		{ value: IssueOrderField.ENVIRONMENT, label: 'Environment' }
	];

	const currentSortField: IssueOrderFieldOptions = $derived(
		(Object.values(IssueOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as IssueOrderFieldOptions | undefined) ?? IssueOrderField.SEVERITY
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.DESC
	);

	function setSort(field: IssueOrderFieldOptions) {
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: OrderDirection.DESC;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' }, { noScroll: true });
	}

	const changeQuery = (
		params: {
			environments?: string;
			severity?: string;
			issueType?: string;
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams(
			{
				environments: params.environments ?? (selectedEnvironments.join(',') || ''),
				severity: params.severity ?? selectedSeverity,
				issueType: params.issueType ?? selectedIssueType,
				before: params.before ?? before,
				after: params.after ?? after
			},
			{ noScroll: true }
		);
	};

	function handleSeverityChange(severity: string) {
		changeQuery({ severity, after: '', before: '' });
	}

	function handleIssueTypeChange(issueType: string) {
		changeQuery({ issueType, after: '', before: '' });
	}

	function handleEnvironmentsChange(selected: string[]) {
		changeQuery({ environments: selected.join(','), after: '', before: '' });
	}
</script>

<GraphErrors errors={$TeamIssues.errors} />

<div class="layout-two-column">
	<div>
		<List title="Issues" count={issues?.pageInfo.totalCount ?? 0}>
			{#snippet actions()}
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
			{#each issues?.edges ?? [] as { node: issue } (issue.id)}
				<IssueListItem item={issue} />
			{:else}
				<ListItem>
					{#if totalCount === 0}
						<span class="empty-state">No issues found</span>
					{:else}
						<span class="empty-state"
							>No issues match the current filters. Try adjusting your filters.</span
						>
					{/if}
				</ListItem>
			{/each}
		</List>
		{#if (issues?.pageInfo.totalCount ?? 0) > 0}
			<Pagination
				page={issues?.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeQuery({ before: issues?.pageInfo.startCursor ?? '', after: '' }),
					loadNextPage: () => changeQuery({ after: issues?.pageInfo.endCursor ?? '', before: '' })
				}}
			/>
		{/if}
	</div>
	<CollapsibleSidebar bind:open={filtersOpen}>
		<SurfaceCard title="Filters">
			<ListFilters
				{sortFields}
				{currentSortField}
				{currentSortDirection}
				onSort={(field) => setSort(field as IssueOrderFieldOptions)}
			>
				<IssuesFacets
					severities={severityFacets}
					{issueTypes}
					environments={allEnvironments}
					{selectedSeverity}
					{selectedIssueType}
					{selectedEnvironments}
					onSeverityChange={handleSeverityChange}
					onIssueTypeChange={handleIssueTypeChange}
					onEnvironmentsChange={handleEnvironmentsChange}
				/>
			</ListFilters>
		</SurfaceCard>
	</CollapsibleSidebar>
</div>

<style>
	.empty-state {
		color: var(--ax-text-neutral-subtle);
	}
</style>
