<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
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
	import InstanceStatus from '../../[env]/app/[app]/InstanceStatus.svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ Workloads } = data);
	$: team = $Workloads.data?.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables($Workloads.variables));
</script>

{#if $Workloads.errors}
	<Alert variant="error">
		{#each $Workloads.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else}
	<div class="grid">
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
					<Th sortable={true} sortKey="STATUS" style="width: 2rem"></Th>
					<Th sortable={true} sortKey="NAME">Name</Th>
					<Th sortable={true} sortKey="ENV" style="width: 2rem">Env</Th>
					<Th sortable={true} sortKey="SEVERITY_CRITICAL" style="width: 2rem">Critical</Th>
					<Th sortable={true} sortKey="RISK_SCORE" style="width: 8rem;">Risk score</Th>
					<Th style="width: 200px">Instances</Th>
					<Th style="width: 150px" sortable={true} sortKey="DEPLOYED">Deployed</Th>
				</Thead>
				<Tbody>
					{#if team !== undefined}
						{#if team.id === PendingValue}
							{#each new Array(team.apps.nodes.length).fill('text') as variant}
								<Tr>
									<Td />
									<Td><Skeleton {variant} /></Td>
									<Td><Skeleton {variant} /></Td>
									<Td><Skeleton {variant} /></Td>
									<Td><Skeleton {variant} /></Td>
									<Td><Skeleton {variant} /></Td>
									<Td><Skeleton {variant} /></Td>
								</Tr>
							{/each}
						{:else}
							{#each team.apps.nodes as node}
								<Tr>
									<Td>
										<div class="status">
											<a
												href="/team/{teamName}/{node.env.name}/app/{node.name}/status"
												data-sveltekit-preload-data="off"
											>
												<Status size="1.5rem" state={node.status.state} />
											</a>
										</div>
									</Td>
									<Td>
										<a href="/team/{teamName}/{node.env.name}/app/{node.name}">{node.name}</a>
									</Td>
									<Td>{node.env.name}</Td>
									<Td style="text-align: center;">
										<Button
											as="a"
											variant="tertiary-neutral"
											size="small"
											href="/team/{teamName}/{node.env.name}/app/{node.name}/image"
										>
											{#if node.image.summary.critical > 0}
												<div class="badge">
													<Tooltip
														placement="right"
														content="{node.image.summary
															.critical} vulnerabilities found. Please update your dependencies!"
													>
														<VulnerabilityBadge
															text={String(node.image.summary.critical)}
															color={severityToColor('critical')}
															size={'32px'}
														/>
													</Tooltip>
												</div>
											{:else if node.image.summary.critical < 0}
												<Tooltip placement="right" content="No data found in dependencytrack">
													NA
												</Tooltip>
											{:else}
												<Tooltip placement="right" content="No critical vulnerabilities found">
													<code class="check success">&check;</code>
												</Tooltip>
											{/if}
										</Button>
									</Td>
									<Td style="text-align: center">
										<Button
											as="a"
											variant="tertiary"
											size="small"
											href="/team/{teamName}/{node.env.name}/app/{node.name}/image"
										>
											{#if node.image.summary.riskScore < 0}
												<Tooltip placement="right" content="No data found in dependencytrack">
													NA
												</Tooltip>
											{:else}
												{node.image.summary.riskScore}
											{/if}
										</Button>
									</Td>

									<Td>
										<InstanceStatus app={node} />
									</Td>
									<Td>
										{#if node.deployInfo.timestamp}
											<Time time={node.deployInfo.timestamp} distance={true} />
										{/if}
									</Td>
								</Tr>
							{:else}
								<Tr>
									<Td colspan={999}>No apps found</Td>
								</Tr>
							{/each}
						{/if}
					{/if}
				</Tbody>
			</Table>
			<Pagination
				pageInfo={team?.apps.pageInfo}
				{limit}
				{offset}
				changePage={(e) => {
					changeParams({ page: e.toString() });
				}}
			/>
		</Card>
	</div>
{/if}

<style>
	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0.6;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
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
