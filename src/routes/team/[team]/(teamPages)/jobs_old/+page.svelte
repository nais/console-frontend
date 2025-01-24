<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { JobOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import FilteredInput, {
		type AppliedFilter,
		type Filter
	} from '$lib/components/FilteredInput/FilteredInput.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Button, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import {
		BriefcaseClockIcon,
		ChevronLeftIcon,
		ChevronRightIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Jobs_old, teamSlug } = $derived(data);

	let filter: string = $state('');

	const handleFilter = () => {
		replaceState(page.url.toString(), {});
		const environments = filters.filter((f) => f.key === 'environment')?.map((f) => f.value);
		Jobs_old.fetch({ variables: { team: teamSlug, filter: { name: freetext, environments } } });
		changeParams({
			direction: tableSort.direction || 'DESC',
			field: tableSort.orderBy || JobOrderField.STATUS,
			environments: environments.join(','),
			filter: freetext
		});
	};

	const onKeyUp = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleFilter();
			return;
		} else if (e.key === 'Escape') {
			filter = '';
			handleFilter();
			return;
		}
	};

	let tableSort = $derived({
		orderBy: $Jobs_old.variables?.orderBy?.field,
		direction: $Jobs_old.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = JobOrderField[key as keyof typeof JobOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || JobOrderField.NAME,
			environments: filters
				.filter((f) => f.key === 'environment')
				?.map((f) => f.value)
				.join(','),
			filter: freetext
		});
	};

	let filters: AppliedFilter[] = $state([]);
	let freetext: string = $state('');
	let supportedFilters: Filter[] = $derived([
		{
			key: 'environment',
			values: $Jobs_old.data?.team.environments
				.filter((env) => env != PendingValue)
				.filter(
					(env) =>
						filters
							.filter((f) => f.key === 'environment')
							?.map((f) => f.value)
							.indexOf(env.name) === -1
				)
				.map((env) => ({ value: env.name }))
		}
	]);
</script>

<GraphErrors errors={$Jobs_old.errors} />

{#if $Jobs_old.data}
	{@const jobs = $Jobs_old.data.team.jobs}
	<Card columns={12}>
		<div class="header">
			<div style="display: flex; align-items: center; width: 50%; gap: 4px;">
				<BriefcaseClockIcon width="32px" height="32px" />
				<h3 style="margin: 0px;">Jobs</h3>
			</div>
			<div style="width:50%">
				<FilteredInput
					bind:filters
					bind:value={filter}
					bind:freetext
					{supportedFilters}
					onkeyup={onKeyUp}
					placeholder="Filter jobs"
				/>
			</div>
		</div>

		<Table
			zebraStripes
			size="small"
			sort={{
				orderBy: tableSort.orderBy || JobOrderField.STATUS,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={JobOrderField.STATUS} style="width: 2rem"></Th>
					<Th sortable={true} sortKey={JobOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={JobOrderField.ENVIRONMENT} style="width: 10rem"
						>Environment</Th
					>
					<Th sortable={true} sortKey={JobOrderField.DEPLOYMENT_TIME} style="width: 150px"
						>Deployed</Th
					>
				</Tr>
			</Thead>
			<Tbody>
				{#if jobs !== undefined}
					{#each jobs.nodes as job}
						{#if job === PendingValue}
							<Tr>
								<Td>
									<Skeleton variant="rounded" />
								</Td>
								<Td>
									<Skeleton variant="text" />
								</Td>
								<Td><Skeleton variant="text" /></Td>
								<Td>
									<Skeleton variant="text" />
								</Td>
							</Tr>
						{:else}
							<Tr>
								<Td>
									<div class="status">
										<a
											href="/team/{teamSlug}/{job.environment.name}/job/{job.name}/status"
											data-sveltekit-preload-data="off"
										>
											<StatusBadge size="1.5rem" state={job.status.state} />
										</a>
									</div>
								</Td>
								<Td>
									<a href="/team/{teamSlug}/{job.environment.name}/job/{job.name}">{job.name}</a>
								</Td>
								<Td>{job.environment.name}</Td>

								<Td>
									{#if job.deploymentInfo.timestamp}
										<Time time={job.deploymentInfo.timestamp} distance={true} />
									{/if}
								</Td>
							</Tr>
						{/if}
					{:else}
						<Tr>
							<Td colspan={999}>No jobs found</Td>
						</Tr>
					{/each}
				{/if}
			</Tbody>
		</Table>
		{#if jobs.pageInfo !== PendingValue}
			{#if jobs.pageInfo.hasPreviousPage || jobs.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if jobs.pageInfo.pageStart !== jobs.pageInfo.pageEnd}
							{jobs.pageInfo.pageStart} - {jobs.pageInfo.pageEnd}
						{:else}
							{jobs.pageInfo.pageStart}
						{/if}

						of {jobs.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!jobs.pageInfo.hasPreviousPage}
							onclick={async () => {
								return await Jobs_old.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!jobs.pageInfo.hasNextPage}
							onclick={async () => {
								return await Jobs_old.loadNextPage();
							}}
						>
							<ChevronRightIcon /></Button
						>
					</span>
				</div>
			{/if}
		{/if}
	</Card>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin: 1rem 0;
	}

	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0.6;
	}
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
