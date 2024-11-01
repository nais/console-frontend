<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { JobOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import Time from '$lib/Time.svelte';
	import {
		Alert,
		Button,
		Table,
		Tbody,
		Td,
		TextField,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Jobs } = data);

	let filter = '';

	const handleFilter = () => {
		if (filter === '') {
			$page.url.searchParams.delete('filter');
		} else {
			$page.url.searchParams.set('filter', filter);
		}
		history.replaceState({}, '', $page.url.toString());
		Jobs.fetch({ variables: { team: teamName, filter: { name: filter } } });
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

	$: tableSort = {
		orderBy: $Jobs.variables?.orderBy?.field,
		direction: $Jobs.variables?.orderBy?.direction
	};

	const changeParams = (params: Record<string, string>) => {
		const query = new URLSearchParams(get(page).url.searchParams);
		for (const [key, value] of Object.entries(params)) {
			query.set(key, value);
		}
		goto(`?${query.toString()}`);
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
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

{#if $Jobs.errors}
	<Alert variant="error">
		{#each $Jobs.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}
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
				on:keyup={onKeyUp}
			>
				<svelte:fragment slot="label">Filter jobs on name</svelte:fragment>
			</TextField>
		</form>
		<Table
			zebraStripes
			size="small"
			sort={{
				orderBy: tableSort.orderBy || JobOrderField.STATUS,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th sortable={true} sortKey={JobOrderField.STATUS} style="width: 2rem"></Th>
				<Th sortable={true} sortKey={JobOrderField.NAME}>Name</Th>
				<Th sortable={true} sortKey={JobOrderField.ENVIRONMENT} style="width: 2rem">Env</Th>
				<Th sortable={true} sortKey={JobOrderField.DEPLOYMENT_TIME} style="width: 150px"
					>Deployed</Th
				>
			</Thead>
			<Tbody>
				{#if jobs !== undefined}
					{#each jobs.edges as edge}
						<Tr>
							<Td>
								<div class="status">
									<a
										href="/team/{teamName}/{edge.node.environment.name}/job/{edge.node.name}/status"
										data-sveltekit-preload-data="off"
									>
										<StatusBadge size="1.5rem" state={edge.node.status.state} />
									</a>
								</div>
							</Td>
							<Td>
								<a href="/team/{teamName}/{edge.node.environment.name}/job/{edge.node.name}"
									>{edge.node.name}</a
								>
							</Td>
							<Td>{edge.node.environment.name}</Td>

							<Td>
								{#if edge.node.deploymentInfo.timestamp}
									<Time time={edge.node.deploymentInfo.timestamp} distance={true} />
								{/if}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}>No jobs found</Td>
						</Tr>
					{/each}
				{/if}
			</Tbody>
		</Table>
		{#if $Jobs.data?.team.jobs.pageInfo.hasPreviousPage || $Jobs.data?.team.jobs.pageInfo.hasNextPage}
			<div class="pagination">
				<span>
					{#if $Jobs.data.team.jobs.pageInfo.pageStart !== $Jobs.data.team.jobs.pageInfo.pageEnd}
						{$Jobs.data.team.jobs.pageInfo.pageStart} - {$Jobs.data.team.jobs.pageInfo.pageEnd}
					{:else}
						{$Jobs.data.team.jobs.pageInfo.pageStart}
					{/if}

					of {$Jobs.data.team.jobs.pageInfo.totalCount}
				</span>

				<span style="padding-left: 1rem;">
					<Button
						size="small"
						variant="secondary"
						disabled={!$Jobs.data.team.jobs.pageInfo.hasPreviousPage}
						on:click={async () => {
							return await Jobs.loadPreviousPage();
						}}><ChevronLeftIcon /></Button
					>
					<Button
						size="small"
						variant="secondary"
						disabled={!$Jobs.data.team.jobs.pageInfo.hasNextPage}
						on:click={async () => {
							return await Jobs.loadNextPage();
						}}
					>
						<ChevronRightIcon /></Button
					>
				</span>
			</div>
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
