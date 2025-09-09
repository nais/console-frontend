<script lang="ts">
	import { IssueOrderField } from '$houdini';
	import IssueListItem from '$lib/components/list/IssueListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Heading } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
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

<div class="wrapper">
	{#if $TeamIssues.data}
		{@const page = $TeamIssues.data.team.issues}
		<div>
			<List title="{page.pageInfo.totalCount} issue{page.pageInfo.totalCount > 1 ? 's' : ''}">
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
					loadPreviousPage: () =>
						changeQuery({ before: page.pageInfo.startCursor ?? '', after: '' }),
					loadNextPage: () => changeQuery({ after: page.pageInfo.endCursor ?? '', before: '' })
				}}
			/>
		</div>
		<div>
			<div class="card">
				<Heading level="3" size="medium" spacing>Issue summary</Heading>
				<TooltipAlignHack
					content={{
						TODO: 'Todo',
						WARNING: 'Warning',
						CRITICAL: 'Critical'
					}['CRITICAL'] ?? ''}
				>
					<CircleFillIcon
						style="color: var(--ax-text-{{
							TODO: 'info',
							WARNING: 'warning',
							CRITICAL: 'danger'
						}['CRITICAL'] ?? 'info'}-decoration); font-size: 0.7rem"
					/>
					{$TeamIssues.data.team.critical.pageInfo.totalCount}
					critical{$TeamIssues.data.team.critical.pageInfo.totalCount !== 1 ? 's' : ''} found
				</TooltipAlignHack>
				<TooltipAlignHack
					content={{
						TODO: 'Todo',
						WARNING: 'Warning',
						CRITICAL: 'Critical'
					}['WARNING'] ?? ''}
				>
					<CircleFillIcon
						style="color: var(--ax-text-{{
							TODO: 'info',
							WARNING: 'warning',
							CRITICAL: 'danger'
						}['WARNING'] ?? 'info'}-decoration); font-size: 0.7rem"
					/>
					{$TeamIssues.data.team.warnings.pageInfo.totalCount}
					warning{$TeamIssues.data.team.warnings.pageInfo.totalCount !== 1 ? 's' : ''} found
				</TooltipAlignHack>
				<TooltipAlignHack
					content={{
						TODO: 'Todo',
						WARNING: 'Warning',
						CRITICAL: 'Critical'
					}['TODO'] ?? ''}
				>
					<CircleFillIcon
						style="color: var(--ax-text-{{
							TODO: 'info',
							WARNING: 'warning',
							CRITICAL: 'danger'
						}['TODO'] ?? 'info'}-decoration); font-size: 0.7rem"
					/>
					{$TeamIssues.data.team.todos.pageInfo.totalCount}
					todo{$TeamIssues.data.team.todos.pageInfo.totalCount !== 1 ? 's' : ''} found
				</TooltipAlignHack>
			</div>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-16) var(--ax-space-20);
		border-radius: 12px;
		align-items: stretch;
	}
</style>
