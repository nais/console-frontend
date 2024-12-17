<script lang="ts">
	import { page } from '$app/state';
	import { JobOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import {
		Button,
		Skeleton,
		Table,
		Tbody,
		Td,
		TextField,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Jobs, teamSlug } = $derived(data);

	let filter: string = $state('');

	const handleFilter = () => {
		if (filter === '') {
			page.url.searchParams.delete('filter');
		} else {
			page.url.searchParams.set('filter', filter);
		}
		history.replaceState({}, '', page.url.toString());
		Jobs.fetch({ variables: { team: teamSlug, filter: { name: filter } } });
	};

	let searchTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

	const onKeyUp = (e: KeyboardEvent) => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		if (e.key === 'Enter') {
			handleFilter();
			return;
		} else if (e.key === 'Escape') {
			filter = '';
			handleFilter();
			return;
		}

		searchTimeout = setTimeout(() => {
			handleFilter();
		}, 1000);
	};

	let tableSort = $derived({
		orderBy: $Jobs.variables?.orderBy?.field,
		direction: $Jobs.variables?.orderBy?.direction
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
			field: tableSort.orderBy || JobOrderField.NAME
		});
	};
</script>

<GraphErrors errors={$Jobs.errors} />

{#if $Jobs.data}
	{@const jobs = $Jobs.data.team.jobs}
	<Card columns={12}>
		<form class="input">
			<TextField
				size="small"
				type="text"
				id="filter"
				style="width: 300px;"
				bind:value={filter}
				onkeyup={onKeyUp}
			>
				{#snippet label()}
					Filter jobs on name
				{/snippet}
			</TextField>
		</form>
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
								return await Jobs.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!jobs.pageInfo.hasNextPage}
							onclick={async () => {
								return await Jobs.loadNextPage();
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
	.input {
		font-size: 1rem;
		margin: 1rem 0;
	}
</style>
