<script lang="ts">
	import { page } from '$app/state';
	import { JobOrderField, OrderDirection } from '$houdini';
	import AggregatedCostForJobs from '$lib/domain/cost/AggregatedCostForJobs.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import JobListItem from '$lib/domain/list-items/JobListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Button, Search } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Jobs, JobsListMetadata, teamSlug } = $derived(data);

	let filter = $state($Jobs.variables?.filter?.name ?? '');

	let after: string = $derived($Jobs.variables?.after ?? '');
	let before: string = $derived($Jobs.variables?.before ?? '');

	const totalJobs = $derived($JobsListMetadata.data?.team.totalJobs.pageInfo.totalCount ?? 0);

	const allEnvs = $derived($Jobs.data?.team.environments.map((env) => env.environment.name) ?? []);

	let filteredEnvs = $derived(page.url.searchParams.get('environments')?.split(',') ?? allEnvs);

	$effect(() => {
		const environments = filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');

		if (environments !== (page.url.searchParams.get('environments') ?? '')) {
			changeQuery({ environments });
		}
	});

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
			environments?: string;
		} = {}
	) => {
		const currentEnvironments =
			filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after,
			filter: params.newFilter ?? filter,
			environments: params.environments ?? currentEnvironments
		});
	};
</script>

<GraphErrors errors={$Jobs.errors} />

<div class="wrapper">
	<div class="content">
		<BodyLong spacing>
			{#if totalJobs == 0}
				<strong>No jobs found.</strong>
			{:else}
				Jobs are used for one-time or scheduled tasks that run to completion and then exit.
				<ExternalLink href={docURL('/workloads/job')}>Learn more about jobs.</ExternalLink>
			{/if}
		</BodyLong>
		{#if totalJobs > 0}
			{@const jobs = $Jobs.data?.team.jobs}
			<div class="search">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						changeQuery({ newFilter: filter });
					}}
				>
					<Search
						clearButton={true}
						clearButtonLabel="Clear"
						label="filter jobs"
						placeholder="Filter by name"
						hideLabel={true}
						size="small"
						variant="simple"
						width="100%"
						autocomplete="off"
						bind:value={filter}
						onclear={() => {
							filter = '';
							changeQuery({ newFilter: '' });
						}}
					/>
				</form>
			</div>

			<List
				title="{jobs?.pageInfo.totalCount} job{jobs?.pageInfo.totalCount !== 1 ? 's' : ''}
						{jobs?.pageInfo.totalCount !== totalJobs ? `(of total ${totalJobs})` : ''}"
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
								<span style="font-weight: normal">Environment</span>
							</Button>
						{/snippet}
						<ActionMenuCheckboxItem
							checked={allEnvs.length === filteredEnvs.length
								? true
								: filteredEnvs.length > 0
									? 'indeterminate'
									: false}
							onchange={(checked) => (filteredEnvs = checked ? allEnvs : [])}
						>
							All environments
						</ActionMenuCheckboxItem>
						{#each $Jobs.data?.team.environments ?? [] as { environment, id } (id)}
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
					</ActionMenu>
					<OrderByMenu
						orderField={JobOrderField}
						defaultOrderField={JobOrderField.ISSUES}
						defaultOrderDirection={OrderDirection.DESC}
					/>
				{/snippet}
				{#each jobs?.nodes ?? [] as job (job.id)}
					<JobListItem {job} />
				{/each}
			</List>
			<Pagination
				page={jobs?.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({ after: '', before: jobs?.pageInfo.startCursor ?? '' });
					},
					loadNextPage: () => {
						changeQuery({ before: '', after: jobs?.pageInfo.endCursor ?? '' });
					}
				}}
			/>
		{/if}
	</div>
	<div class="right-column">
		{#if totalJobs > 0}
			<AggregatedCostForJobs {teamSlug} totalCount={totalJobs} />
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
	.right-column {
		display: grid;
		gap: var(--ax-space-24);
	}
	.search {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}
</style>
