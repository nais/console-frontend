<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { JobOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Status from '$lib/components/Status.svelte';
	import { Alert, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Jobs } = data);

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
		<Table
			zebraStripes
			size="small"
			sort={{
				orderBy: tableSort.orderBy || JobOrderField.NAME,
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
										<Status size="1.5rem" state={edge.node.status.state} />
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
								TODO
								<!--{#if edge.node.deployInfo.timestamp}
									<Time time={edge.node.deployInfo.timestamp} distance={true} />
								{/if}-->
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
	</Card>
	<!--ActivityLog {teamName} resourceType={AuditEventResourceType.NAISJOB} columns={12} /-->
{/if}

<style>
	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0.6;
	}
</style>
