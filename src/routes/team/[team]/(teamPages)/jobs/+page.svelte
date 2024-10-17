<script lang="ts">
	import { page } from '$app/stores';
	import { AuditEventResourceType, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Status from '$lib/Status.svelte';
	import Time from '$lib/Time.svelte';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import {
		Alert,
		Button,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import ActivityLog from '$lib/components/ActivityLog.svelte';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Jobs } = data);
	$: team = $Jobs.data?.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables($Jobs.variables));
</script>

{#if $Jobs.errors}
	<Alert variant="error">
		{#each $Jobs.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else}
	<Card columns={12}>
		<Table
			zebraStripes
			size="small"
			sort={sortState}
			on:sortChange={(e) => {
				const { key } = e.detail;
				const ss = sortTable(key, sortState);
				changeParams({ col: ss.orderBy, dir: tableGraphDirection[ss.direction] });
			}}
		>
			<Thead>
				<Th sortable={true} sortKey="STATUS" style="width: 3rem"></Th>
				<Th sortable={true} sortKey="NAME">Name</Th>
				<Th sortable={true} sortKey="ENV">Env</Th>
				<Th sortable={true} sortKey="DEPLOYED" style="width: 2rem">Deployed</Th>
			</Thead>
			<Tbody>
				{#if team !== undefined}
					{#if team.id === PendingValue}
						{#each new Array(team.naisjobs.nodes.length).fill('text') as variant}
							<Tr>
								<Td />
								<Td><Skeleton {variant} /></Td>
								<Td><Skeleton {variant} /></Td>
								<Td><Skeleton {variant} /></Td>
								<Td><Skeleton {variant} /></Td>
							</Tr>
						{/each}
					{:else}
						{#each team.naisjobs.nodes as node}
							<Tr>
								<Td>
									<div class="status">
										<a
											href="/team/{teamName}/{node.env.name}/job/{node.name}/status"
											data-sveltekit-preload-data="off"
										>
											<Status size="1.5rem" state={node.status.state} />
										</a>
									</div>
								</Td>
								<Td>
									<a href="/team/{teamName}/{node.env.name}/job/{node.name}">{node.name}</a>
								</Td>
								<Td>{node.env.name}</Td>
								<Td>
									{#if node.deployInfo.timestamp}
										<Time time={node.deployInfo.timestamp} distance={true} />
									{/if}
								</Td>
							</Tr>
						{:else}
							<Tr>
								<Td colspan={999}>No jobs found</Td>
							</Tr>
						{/each}
					{/if}
				{/if}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={team?.naisjobs.pageInfo}
			{limit}
			{offset}
			changePage={(e) => {
				changeParams({ page: e.toString() });
			}}
		/>
	</Card>
	<ActivityLog {teamName} resourceType={AuditEventResourceType.NAISJOB} columns={12} />
{/if}

<style>
	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0.6;
	}
	.badge {
		display: flex;
		justify-content: center;
		vertical-align: middle;
		width: 100%;
		height: 32px;
	}
	.badge {
		display: flex;
		justify-content: center;
		vertical-align: middle;
		width: 100%;
		height: 32px;
	}

	.check {
		font-size: 1.5rem;
		text-align: center;
		padding-left: 4px;
	}
	.success {
		color: #4dbd74;
	}
</style>
