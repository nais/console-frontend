<script lang="ts">
	import { IssueOrderField } from '$houdini';
	import IssueListItem from '$lib/components/list/IssueListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamIssues } = $derived(data);

	let after: string = $derived($TeamIssues.variables?.after ?? '');
	let before: string = $derived($TeamIssues.variables?.before ?? '');

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after
		});
	};
</script>

{#if $TeamIssues.data}
	{@const page = $TeamIssues.data.team.issues}
	<List title="You've got issues">
		{#snippet menu()}
			<OrderByMenu orderField={IssueOrderField} defaultOrderField={IssueOrderField.SEVERITY} />
		{/snippet}
		{#each page.nodes as issue (issue.id)}
			<IssueListItem item={issue} />
		{/each}
	</List>
	<Pagination
		page={page.pageInfo}
		loaders={{
			loadPreviousPage: () => changeQuery({ before: page.pageInfo.startCursor ?? '', after: '' }),
			loadNextPage: () => changeQuery({ after: page.pageInfo.endCursor ?? '', before: '' })
		}}
	/>
{/if}
