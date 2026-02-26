<script lang="ts">
	import { page } from '$app/state';
	import IssueTypeSeverityFilters from '$lib/domain/issues/IssueTypeSeverityFilters.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button } from '@nais/ds-svelte-community';
	import { ActionMenu } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { JobIssues } = $derived(data);
	let issues = $derived($JobIssues.data?.team.environment.job.issues);

	let after: string = $derived($JobIssues.variables?.after ?? '');
	let before: string = $derived($JobIssues.variables?.before ?? '');

	const changeQuery = (
		params: {
			environments?: string;
			severity?: string | undefined;
			issueType?: string | undefined;
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams({
			environments: params.environments ?? '',
			severity: params.severity ?? '',
			issueType: params.issueType ?? '',
			before: params.before ?? before,
			after: params.after ?? after
		});
	};
</script>

<GraphErrors errors={$JobIssues.errors} />

<div class="wrapper">
	<div>
		<List
			title="{issues?.pageInfo.totalCount} issue{issues?.pageInfo.totalCount !== 1 ? 's' : ''}
						{issues?.pageInfo.totalCount !== $JobIssues.data?.team.environment.job.issues.pageInfo.totalCount
				? `(of total ${$JobIssues.data?.team.environment.job.issues.pageInfo.totalCount})`
				: ''}"
		>
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
							<span style="font-weight: normal">Filters</span>
						</Button>
					{/snippet}
					<IssueTypeSeverityFilters
						severity={page.url.searchParams.get('severity') ?? ''}
						issueType={page.url.searchParams.get('issueType') ?? ''}
						onSeverityChange={(severity) => changeQuery({ severity })}
						onIssueTypeChange={(issueType) => changeQuery({ issueType })}
					/>
				</ActionMenu>
			{/snippet}
			{#each issues?.nodes ?? [] as issue (issue.id)}
				<IssueListItem item={issue} />
			{:else}
				<div>No issues found</div>
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
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
</style>
