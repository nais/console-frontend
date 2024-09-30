<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { JobOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import {
		Alert,
		Button,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Jobs } = data);
	$: team = $Jobs.data?.team;

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
			sort={{
				orderBy: tableSort.orderBy || 'NAME',
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={(e) => {
				const { key } = e.detail;
				if (key === tableSort.orderBy) {
					const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
					tableSort.direction = direction;
				} else {
					tableSort.orderBy = JobOrderField[key];
					tableSort.direction = 'ASC';
				}

				changeParams({
					direction: tableSort.direction,
					field: tableSort.orderBy || 'NAME'
				});
			}}
		>
			<Thead>
				<Th style="width: 2rem"></Th>
				<Th sortable={true} sortKey="NAME">Name</Th>
				<Th sortable={true} sortKey="ENV" style="width: 2rem">Env</Th>
				<Th style="width: 2rem">Critical</Th>
				<Th style="width: 8rem;">Risk score</Th>
				<Th style="width: 150px">Deployed</Th>
			</Thead>
			<Tbody>
				{#if team !== undefined}
					{#each team.jobs.edges as edge}
						<Tr>
							<Td>
								<div class="status">
									<a
										href="/team/{teamName}/{edge.node.environment.name}/job/{edge.node.name}/status"
										data-sveltekit-preload-data="off"
									>
										TODO<!--Status size="1.5rem" state={edge.node.status.state} /-->
									</a>
								</div>
							</Td>
							<Td>
								<a href="/team/{teamName}/{edge.node.environment.name}/job/{edge.node.name}"
									>{edge.node.name}</a
								>
							</Td>
							<Td>{edge.node.environment.name}</Td>
							<Td style="text-align: center;">
								<Button
									as="a"
									variant="tertiary-neutral"
									size="small"
									href="/team/{teamName}/{edge.node.environment.name}/job/{edge.node.name}/image"
								>
									{#if edge.node.image.vulnerabilitySummary}
										{#if edge.node.image.vulnerabilitySummary.critical > 0}
											<div class="badge">
												<Tooltip
													placement="right"
													content="{edge.node.image.vulnerabilitySummary
														.critical} vulnerabilities found. Please update your dependencies!"
												>
													<VulnerabilityBadge
														text={String(edge.node.image.vulnerabilitySummary.critical)}
														color={severityToColor('critical')}
														size={'32px'}
													/>
												</Tooltip>
											</div>
										{:else}
											<Tooltip placement="right" content="No critical vulnerabilities found">
												<code class="check success">&check;</code>
											</Tooltip>
										{/if}
									{:else}
										<Tooltip placement="right" content="No data found in dependencytrack">
											NA
										</Tooltip>
									{/if}
								</Button>
							</Td>
							<Td style="text-align: center">
								<Button
									as="a"
									variant="tertiary"
									size="small"
									href="/team/{teamName}/{edge.node.environment.name}/job/{edge.node.name}/image"
								>
									{#if edge.node.image.vulnerabilitySummary}
										{edge.node.image.vulnerabilitySummary.riskScore}
									{:else}
										<Tooltip placement="right" content="No data found in dependencytrack">
											NA
										</Tooltip>
									{/if}
								</Button>
							</Td>

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
