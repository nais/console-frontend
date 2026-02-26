<script lang="ts">
	import { page } from '$app/state';
	import { IssueOrderField } from '$houdini';
	import IssueTypeSeverityFilters from '$lib/domain/issues/IssueTypeSeverityFilters.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuCheckboxItem,
		ActionMenuGroup
	} from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamIssues, TeamIssuesMetadata } = $derived(data);
	let issues = $derived($TeamIssues.data?.team.issues);
	let issueCount = $derived(issues?.pageInfo.totalCount ?? 0);
	let totalCount = $derived($TeamIssues.data?.team.total.pageInfo.totalCount ?? 0);

	let after: string = $derived($TeamIssues.variables?.after ?? '');
	let before: string = $derived($TeamIssues.variables?.before ?? '');

	const allEnvs = $derived(
		$TeamIssuesMetadata.data?.team.environments.map((env) => env.environment.name) ?? []
	);

	let filteredEnvs = $derived(page.url.searchParams.get('environments')?.split(',') ?? allEnvs);

	$effect(() => {
		const environments = filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');

		if (environments !== (page.url.searchParams.get('environments') ?? '')) {
			changeQuery({ environments });
		}
	});

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

<GraphErrors errors={$TeamIssues.errors} />

<div class="wrapper">
	<div>
		<List
			title="{issueCount} issue{issueCount !== 1 ? 's' : ''}
						{issueCount !== totalCount ? `(of total ${totalCount})` : ''}"
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
					<ActionMenuGroup label="Environment">
						<ActionMenuCheckboxItem
							checked={$TeamIssues.data?.team.environments.every((env) =>
								filteredEnvs.includes(env.environment.name)
							)
								? true
								: filteredEnvs.length > 0
									? 'indeterminate'
									: false}
							onchange={(checked) => (filteredEnvs = checked ? allEnvs : [])}
						>
							All environments
						</ActionMenuCheckboxItem>
						{#each $TeamIssues.data?.team.environments ?? [] as { environment, id } (id)}
							<ActionMenuCheckboxItem
								checked={filteredEnvs.includes(environment.name)}
								onchange={(checked) =>
									(filteredEnvs = checked
										? [...filteredEnvs, environment.name]
										: filteredEnvs.filter((env) => env !== environment.name))}
							>
								{environment.name}
							</ActionMenuCheckboxItem>
						{/each}
					</ActionMenuGroup>
					<IssueTypeSeverityFilters
						severity={page.url.searchParams.get('severity') ?? ''}
						issueType={page.url.searchParams.get('issueType') ?? ''}
						onSeverityChange={(severity) => changeQuery({ severity })}
						onIssueTypeChange={(issueType) => changeQuery({ issueType })}
					/>
				</ActionMenu>
				<OrderByMenu orderField={IssueOrderField} defaultOrderField={IssueOrderField.SEVERITY} />
			{/snippet}
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
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.empty-state {
		color: var(--ax-text-subtle);
	}
</style>
