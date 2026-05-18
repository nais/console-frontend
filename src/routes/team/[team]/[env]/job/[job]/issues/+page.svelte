<script lang="ts">
	import { page } from '$app/state';
	import { IssueOrderField, OrderDirection } from '$houdini';
	import WorkloadIssuesFacets from '$lib/domain/issues/WorkloadIssuesFacets.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { JobIssues } = $derived(data);
	let issues = $derived($JobIssues.data?.team.environment.job.issues);

	let after: string = $derived($JobIssues.variables?.after ?? '');
	let before: string = $derived($JobIssues.variables?.before ?? '');

	let selectedSeverity: string = $derived(page.url.searchParams.get('severity') ?? '');
	let selectedIssueType: string = $derived(page.url.searchParams.get('issueType') ?? '');

	type IssueOrderFieldOptions = (typeof IssueOrderField)[keyof typeof IssueOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	const sortFields: { value: IssueOrderFieldOptions; label: string }[] = [
		{ value: IssueOrderField.SEVERITY, label: 'Severity' },
		{ value: IssueOrderField.ISSUE_TYPE, label: 'Issue type' }
	];

	const currentSortField: IssueOrderFieldOptions = $derived(
		(Object.values(IssueOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as IssueOrderFieldOptions | undefined) ?? IssueOrderField.SEVERITY
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function setSort(field: IssueOrderFieldOptions) {
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: OrderDirection.ASC;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' }, { noScroll: true });
	}

	const changeQuery = (
		params: {
			severity?: string;
			issueType?: string;
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams(
			{
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
</script>

<GraphErrors errors={$JobIssues.errors} />

<div class="layout-two-column">
	<div>
		<List title="Issues" count={issues?.pageInfo.totalCount ?? 0}>
			{#each issues?.nodes ?? [] as issue (issue.id)}
				<IssueListItem item={issue} />
			{:else}
				<ListItem>
					<span class="empty-state">No issues found</span>
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
	<div class="layout-sidebar">
		<SurfaceCard title="Filters">
			<ListFilters
				{sortFields}
				{currentSortField}
				{currentSortDirection}
				onSort={(field) => setSort(field as IssueOrderFieldOptions)}
			>
				<WorkloadIssuesFacets
					{selectedSeverity}
					{selectedIssueType}
					onSeverityChange={handleSeverityChange}
					onIssueTypeChange={handleIssueTypeChange}
				/>
			</ListFilters>
		</SurfaceCard>
	</div>
</div>

<style>
	.empty-state {
		color: var(--ax-text-neutral-subtle);
	}
</style>
