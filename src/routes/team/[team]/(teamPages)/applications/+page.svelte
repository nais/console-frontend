<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { ApplicationOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import FilteredInput, {
		type AppliedFilter,
		type Filter
	} from '$lib/components/FilteredInput/FilteredInput.svelte';
	import InstanceStatus from '$lib/components/InstanceStatus.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Button, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon, PackageIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Applications, teamSlug } = $derived(data);

	let filter: string = $state('');

	const handleFilter = () => {
		replaceState(page.url.toString(), {});
		const environments = filters.filter((f) => f.key === 'environment')?.map((f) => f.value);
		Applications.fetch({ variables: { team: teamSlug, filter: { name: freetext, environments } } });
		changeParams({
			direction: tableSort.direction || 'DESC',
			field: tableSort.orderBy || ApplicationOrderField.STATUS,
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
		orderBy: $Applications.variables?.orderBy?.field,
		direction: $Applications.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = ApplicationOrderField[key as keyof typeof ApplicationOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction || 'DESC',
			field: tableSort.orderBy || ApplicationOrderField.STATUS,
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
			values: $Applications.data?.team.environments
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

<GraphErrors errors={$Applications.errors} />

{#if $Applications.data}
	{@const applications = $Applications.data.team.applications}
	<Card columns={12}>
		<div class="header">
			<div style="display: flex; align-items: center; width: 50%; gap: 4px;">
				<PackageIcon width="32px" height="32px" />
				<h3 style="margin: 0px;">Applications</h3>
			</div>
			<div style="width:50%">
				<FilteredInput
					bind:filters
					bind:value={filter}
					bind:freetext
					{supportedFilters}
					onkeyup={onKeyUp}
					placeholder="Filter applications"
				/>
			</div>
		</div>

		<Table
			zebraStripes
			size="small"
			sort={{
				orderBy: tableSort.orderBy || ApplicationOrderField.STATUS,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={ApplicationOrderField.STATUS} style="width: 2rem"></Th>
					<Th sortable={true} sortKey={ApplicationOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={ApplicationOrderField.ENVIRONMENT} style="width: 10rem"
						>Environment</Th
					>
					<Th style="width: 200px">Instances</Th>
					<Th sortable={true} sortKey={ApplicationOrderField.DEPLOYMENT_TIME} style="width: 150px"
						>Deployed</Th
					>
				</Tr>
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
											href="/team/{teamSlug}/{app.environment.name}/app/{app.name}/status"
											data-sveltekit-preload-data="off"
										>
											<StatusBadge size="1.5rem" state={app.status.state} />
										</a>
									</div>
								</Td>
								<Td>
									<a href="/team/{teamSlug}/{app.environment.name}/app/{app.name}">{app.name}</a>
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
							onclick={async () => {
								return await Applications.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!applications.pageInfo.hasNextPage}
							onclick={async () => {
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
