<script lang="ts">
	import { page } from '$app/stores';
	import { ApplicationOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import InstanceStatus from '$lib/components/InstanceStatus.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams';
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

	export let data: PageData;
	$: ({ Applications } = data);

	$: teamName = $page.params.team;

	let filter: string = '';

	const handleFilter = () => {
		if (filter === '') {
			$page.url.searchParams.delete('filter');
		} else {
			$page.url.searchParams.set('filter', filter);
		}
		history.replaceState({}, '', $page.url.toString());
		Applications.fetch({ variables: { team: teamName, filter: { name: filter } } });
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
		orderBy: $Applications.variables?.orderBy?.field,
		direction: $Applications.variables?.orderBy?.direction
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = ApplicationOrderField[key as keyof typeof ApplicationOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction || 'DESC',
			field: tableSort.orderBy || ApplicationOrderField.STATUS
		});
	};
</script>

<GraphErrors errors={$Applications.errors} />

{#if $Applications.data}
	{@const applications = $Applications.data.team.applications}
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
				<svelte:fragment slot="label">Filter applications on name</svelte:fragment>
			</TextField>
		</form>
		<Table
			zebraStripes
			size="small"
			sort={{
				orderBy: tableSort.orderBy || ApplicationOrderField.STATUS,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th sortable={true} sortKey={ApplicationOrderField.STATUS} style="width: 2rem"></Th>
				<Th sortable={true} sortKey={ApplicationOrderField.NAME}>Name</Th>
				<Th sortable={true} sortKey={ApplicationOrderField.ENVIRONMENT} style="width: 10rem"
					>Environment</Th
				>
				<Th style="width: 200px">Instances</Th>
				<Th sortable={true} sortKey={ApplicationOrderField.DEPLOYMENT_TIME} style="width: 150px"
					>Deployed</Th
				>
			</Thead>
			<Tbody>
				{#if applications !== undefined}
					{#each applications.nodes as app}
						{#if app === PendingValue}
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
								<Td>
									<Skeleton variant="text" />
								</Td>
							</Tr>
						{:else}
							<Tr>
								<Td>
									<div class="status">
										<a
											href="/team/{teamName}/{app.environment.name}/app/{app.name}/status"
											data-sveltekit-preload-data="off"
										>
											<StatusBadge size="1.5rem" state={app.status.state} />
										</a>
									</div>
								</Td>
								<Td>
									<a href="/team/{teamName}/{app.environment.name}/app/{app.name}">{app.name}</a>
								</Td>
								<Td>{app.environment.name}</Td>
								<Td>
									<InstanceStatus {app} />
								</Td>
								<Td>
									{#if app.deploymentInfo.timestamp}
										<Time time={app.deploymentInfo.timestamp} distance={true} />
									{/if}
								</Td>
							</Tr>
						{/if}
					{:else}
						<Tr>
							<Td colspan={999}>No applications found</Td>
						</Tr>
					{/each}
				{/if}
			</Tbody>
		</Table>
		{#if applications.pageInfo !== PendingValue}
			{#if applications.pageInfo.hasPreviousPage || applications.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if applications.pageInfo.pageStart !== applications.pageInfo.pageEnd}
							{applications.pageInfo.pageStart} - {applications.pageInfo.pageEnd}
						{:else}
							{applications.pageInfo.pageStart}
						{/if}

						of {applications.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!applications.pageInfo.hasPreviousPage}
							on:click={async () => {
								return await Applications.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!applications.pageInfo.hasNextPage}
							on:click={async () => {
								return await Applications.loadNextPage();
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
