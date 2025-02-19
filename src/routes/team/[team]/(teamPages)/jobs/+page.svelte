<script lang="ts">
	import { page } from '$app/state';
	import {
		JobOrderField,
		OrderDirection,
		type JobOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import AggregatedCostForJobs from '$lib/components/AggregatedCostForJobs.svelte';
	import JobListItem from '$lib/components/list/JobListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { BodyLong, Button, Search } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental.js';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Jobs } = $derived(data);

	let filter = $state($Jobs.variables?.filter?.name ?? '');

	let after: string = $derived($Jobs.variables?.after ?? '');
	let before: string = $derived($Jobs.variables?.before ?? '');

	let orderField: keyof typeof JobOrderField = $derived(
		$Jobs.variables?.orderBy?.field ?? JobOrderField.NAME
	);

	let orderDirection: keyof typeof OrderDirection = $derived(
		$Jobs.variables?.orderBy?.direction ?? OrderDirection.ASC
	);

	const allEnvs = $Jobs.data?.team.environments.map((env) => env.name) ?? [];

	let filteredEnvs = $state(
		page.url.searchParams.get('environments') === 'none'
			? []
			: (page.url.searchParams.get('environments')?.split(',') ?? allEnvs)
	);

	$effect(() => {
		const environments =
			filteredEnvs.length === 0
				? 'none'
				: filteredEnvs.length === allEnvs.length
					? ''
					: filteredEnvs.join(',');

		if (environments !== (page.url.searchParams.get('environments') ?? '')) {
			changeQuery({ environments });
		}
	});

	const changeQuery = (
		params: {
			field?: JobOrderField$options;
			direction?: OrderDirection$options;
			after?: string;
			before?: string;
			newFilter?: string;
			environments?: string;
		} = {}
	) => {
		changeParams({
			direction: params.direction || orderDirection,
			field: params.field || orderField,
			before: params.before ?? before,
			after: params.after ?? after,
			filter: params.newFilter ?? filter,
			environments: params.environments ?? ''
		});
	};
</script>

<GraphErrors errors={$Jobs.errors} />

<div class="wrapper">
	<div class="content">
		<BodyLong spacing>
			{#if $Jobs.data?.team.totalJobs.pageInfo.totalCount == 0}
				<strong>No jobs found.</strong> Jobs are used for one-time or scheduled tasks that run to
				completion and then exit.
				<a href="https://doc.nais.io/workloads/job/"
					>Learn more about jobs and how to get started.</a
				>
			{:else}
				Jobs are used for one-time or scheduled tasks that run to completion and then exit.
				<a href="https://doc.nais.io/workloads/job/">Learn more about jobs.</a>
			{/if}
		</BodyLong>

		{#if $Jobs.data && ($Jobs.data.team.jobs.nodes.length > 0 || filter !== '')}
			{@const jobs = $Jobs.data.team.jobs}
			{#if jobs.nodes.length > 0 || $Jobs.data.team.totalJobs.pageInfo.totalCount > 0}
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
					title="{jobs.pageInfo.totalCount} job{jobs.pageInfo.totalCount !== 1 ? 's' : ''}
						{jobs.pageInfo.totalCount !== $Jobs.data.team.totalJobs.pageInfo.totalCount
						? `(of total ${$Jobs.data.team.totalJobs.pageInfo.totalCount})`
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
							{#each $Jobs.data?.team.environments ?? [] as { name, id } (id)}
								<ActionMenuCheckboxItem
									checked={filteredEnvs.includes(name)}
									onchange={(checked) =>
										(filteredEnvs = checked
											? [...filteredEnvs, name]
											: filteredEnvs.filter((env) => env !== name))}
								>
									{name}
								</ActionMenuCheckboxItem>
							{/each}
						</ActionMenu>
						<OrderByMenu OrderField={JobOrderField} defaultOrderField={JobOrderField.NAME} />
					{/snippet}
					{#each jobs.nodes as job (job.id)}
						<JobListItem {job} />
					{/each}
				</List>
				<Pagination
					page={jobs.pageInfo}
					loaders={{
						loadPreviousPage: () => {
							changeQuery({ after: '', before: jobs.pageInfo.startCursor ?? '' });
						},
						loadNextPage: () => {
							changeQuery({ before: '', after: jobs.pageInfo.endCursor ?? '' });
						}
					}}
				/>
			{/if}
		{/if}
	</div>
	<div>
		{#if $Jobs.data?.team.slug}
			{#if $Jobs.data?.team.totalJobs.pageInfo.totalCount > 0}
				{@const teamSlug = $Jobs.data.team.slug}
				<AggregatedCostForJobs
					{teamSlug}
					totalCount={$Jobs.data?.team.totalJobs.pageInfo.totalCount}
				/>
			{/if}
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--a-spacing-12);
	}
	.search {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}
</style>
