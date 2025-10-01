<script lang="ts">
	import IssueListItem from '$lib/components/list/IssueListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { ApplicationIssues } = $derived(data);

	let after: string = $derived($ApplicationIssues.variables?.after ?? '');
	let before: string = $derived($ApplicationIssues.variables?.before ?? '');

	const totalIssues = $derived(
		$ApplicationIssues.data?.team.environment.application.issues.pageInfo.totalCount ?? 0
	);

	const changeQuery = (
		params: {
			environments?: string;
			severity?: string | undefined;
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams({
			environments: params.environments ?? '',
			severity: params.severity ?? '',
			before: params.before ?? before,
			after: params.after ?? after
		});
	};
</script>

<GraphErrors errors={$ApplicationIssues.errors} />

<div class="wrapper">
	{#if totalIssues > 0}
		{@const issues = $ApplicationIssues.data?.team.environment.application.issues}
		<div>
			<List
				title="{issues?.pageInfo.totalCount} issue{issues?.pageInfo.totalCount !== 1 ? 's' : ''}
						{issues?.pageInfo.totalCount !==
				$ApplicationIssues.data?.team.environment.application.issues.pageInfo.totalCount
					? `(of total ${$ApplicationIssues.data?.team.environment.application.issues.pageInfo.totalCount})`
					: ''}"
			>
				{#each issues?.nodes ?? [] as issue (issue.id)}
					<IssueListItem item={issue} />
				{/each}
			</List>
			<Pagination
				page={issues?.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeQuery({ before: issues?.pageInfo.startCursor ?? '', after: '' }),
					loadNextPage: () => changeQuery({ after: issues?.pageInfo.endCursor ?? '', before: '' })
				}}
			/>
		</div>
	{:else}
		<div>No issues found</div>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
</style>
