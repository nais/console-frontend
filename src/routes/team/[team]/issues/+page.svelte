<script lang="ts">
	import { page } from '$app/state';
	import { IssueOrderField, Severity } from '$houdini';
	import IssueListItem from '$lib/components/list/IssueListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Heading } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuCheckboxItem,
		ActionMenuGroup,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon, CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamIssues } = $derived(data);

	let after: string = $derived($TeamIssues.variables?.after ?? '');
	let before: string = $derived($TeamIssues.variables?.before ?? '');

	const allEnvs = $derived(
		$TeamIssues.data?.team.environments.map((env) => env.environment.name) ?? []
	);

	let filteredEnvs = $derived(
		page.url.searchParams.get('environments') === 'none'
			? []
			: (page.url.searchParams.get('environments')?.split(',') ?? allEnvs)
	);

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

<GraphErrors errors={$TeamIssues.errors} />

<div class="wrapper">
	{#if $TeamIssues.data}
		{@const issues = $TeamIssues.data.team.issues}
		<div>
			<List
				title="{issues.pageInfo.totalCount} issue{issues.pageInfo.totalCount !== 1 ? 's' : ''}
						{issues.pageInfo.totalCount !== $TeamIssues.data.team.total.pageInfo.totalCount
					? `(of total ${$TeamIssues.data.team.total.pageInfo.totalCount})`
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
						<ActionMenuRadioGroup
							value={$TeamIssues.variables?.filter?.severity ?? ''}
							label="Severity"
						>
							<ActionMenuRadioItem value="" onselect={() => changeParams({ severity: '' })}
								>All severities</ActionMenuRadioItem
							>

							{#each Object.values(Severity) as severity (severity)}
								<ActionMenuRadioItem
									value={severity}
									onselect={() => changeParams({ severity: String(severity) })}
								>
									{severity.charAt(0) + severity.slice(1).toLowerCase()}
								</ActionMenuRadioItem>
							{/each}
						</ActionMenuRadioGroup>
					</ActionMenu>
					<OrderByMenu orderField={IssueOrderField} defaultOrderField={IssueOrderField.SEVERITY} />
				{/snippet}
				{#each issues.nodes as issue (issue.id)}
					<IssueListItem item={issue} />
				{/each}
			</List>
			<Pagination
				page={issues.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeQuery({ before: issues.pageInfo.startCursor ?? '', after: '' }),
					loadNextPage: () => changeQuery({ after: issues.pageInfo.endCursor ?? '', before: '' })
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
						}['CRITICAL'] ?? 'info'}-decoration); font-size: 0.8rem"
					/>
					<span style="font-size: 1.2rem; font-weight: bold"
						>{$TeamIssues.data.team.critical.pageInfo.totalCount}
						critical issue{$TeamIssues.data.team.critical.pageInfo.totalCount !== 1 ? 's' : ''} found</span
					>
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
						}['WARNING'] ?? 'info'}-decoration); font-size: 0.8rem"
					/>
					<span style="font-size: 1.2rem; font-weight: bold"
						>{$TeamIssues.data.team.warnings.pageInfo.totalCount}
						warning{$TeamIssues.data.team.warnings.pageInfo.totalCount !== 1 ? 's' : ''} found</span
					>
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
						}['TODO'] ?? 'info'}-decoration); font-size: 0.8rem"
					/>
					<span style="font-size: 1.2rem; font-weight: bold"
						>{$TeamIssues.data.team.todos.pageInfo.totalCount}
						todo{$TeamIssues.data.team.todos.pageInfo.totalCount !== 1 ? 's' : ''} found</span
					>
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
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-16) var(--ax-space-20);
		border-radius: 12px;
		align-items: stretch;
		padding-bottom: var(--ax-space-32);
	}
</style>
