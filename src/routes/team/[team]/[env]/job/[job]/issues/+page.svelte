<script lang="ts">
	import { IssueType, Severity } from '$houdini';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { issueTypeLabel } from '$lib/utils/issueTypeLabel';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { JobIssues } = $derived(data);

	let after: string = $derived($JobIssues.variables?.after ?? '');
	let before: string = $derived($JobIssues.variables?.before ?? '');

	const totalIssues = $derived(
		$JobIssues.data?.team.environment.job.issues.pageInfo.totalCount ?? 0
	);

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
	{#if totalIssues > 0}
		{@const issues = $JobIssues.data?.team.environment.job.issues}
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
						<ActionMenuRadioGroup
							value={$JobIssues.variables?.filter?.severity ?? ''}
							label="Severity"
						>
							<ActionMenuRadioItem value="" onselect={() => changeQuery({ severity: '' })}
								>All severities</ActionMenuRadioItem
							>

							{#each Object.values(Severity) as severity (severity)}
								<ActionMenuRadioItem
									value={severity}
									onselect={() => changeQuery({ severity: String(severity) })}
								>
									{severity.charAt(0) + severity.slice(1).toLowerCase()}
								</ActionMenuRadioItem>
							{/each}
						</ActionMenuRadioGroup>
						<ActionMenuRadioGroup
							value={$JobIssues.variables?.filter?.issueType ?? ''}
							label="Issue type"
						>
							<ActionMenuRadioItem value="" onselect={() => changeQuery({ issueType: '' })}
								>All issue types</ActionMenuRadioItem
							>
							{#each Object.values(IssueType) as issueType (issueType)}
								<ActionMenuRadioItem
									value={issueType}
									onselect={() => changeQuery({ issueType: String(issueType) })}
								>
									{issueTypeLabel(issueType)}
								</ActionMenuRadioItem>
							{/each}
						</ActionMenuRadioGroup>
					</ActionMenu>
				{/snippet}
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
