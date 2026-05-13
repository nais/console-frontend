<script lang="ts">
	import { page } from '$app/state';
	import { IssueOrderField, IssueType, OrderDirection } from '$houdini';
	import IssuesFacets from '$lib/domain/issues/IssuesFacets.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { SortDownIcon, SortUpIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamIssues, TeamIssuesMetadata } = $derived(data);
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

<div class="wrapper">
	<div>
		<List title="Issues" count={issues?.pageInfo.totalCount ?? 0}>
			{#each issues?.nodes ?? [] as issue (issue.id)}
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
	<div class="right-column">
		<SurfaceCard title="Filters">
			<div class="sidebar-section">
				<h4 class="section-heading">Sort By</h4>
				<div class="sort-options">
					{#each sortFields as { value, label } (value)}
						{@const isActive = currentSortField === value}
						<button
							type="button"
							class="sort-option"
							class:active={isActive}
							onclick={() => setSort(value)}
						>
							<span class="sort-option-label">{label}</span>
							{#if isActive}
								<span class="sort-direction">
									{#if currentSortDirection === 'ASC'}
										<SortUpIcon />
									{:else}
										<SortDownIcon />
									{/if}
								</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>

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
		</SurfaceCard>
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

	.sidebar-section {
		margin-bottom: var(--ax-space-16);
	}

	.section-heading {
		font-size: var(--ax-font-size-small);
		font-weight: 600;
		color: var(--ax-text-neutral-subtle);
		margin: 0 0 var(--ax-space-8) 0;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
		padding-bottom: var(--ax-space-8);
	}

	.sort-options {
		display: flex;
		flex-direction: column;
	}

	.sort-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-8);
		padding: var(--ax-space-6) var(--ax-space-8);
		border: none;
		border-radius: var(--ax-radius-8);
		background: transparent;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
		cursor: pointer;
		text-align: left;
		transition: background-color 120ms ease;
	}

	.sort-option:hover {
		background: var(--ax-bg-neutral-moderate);
	}

	.sort-option.active {
		font-weight: 600;
		color: var(--ax-text-accent);
	}

	.sort-direction {
		font-size: var(--ax-font-size-small);
		font-weight: 600;
	}

	.empty-state {
		color: var(--ax-text-subtle);
	}

	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}
	}
</style>
