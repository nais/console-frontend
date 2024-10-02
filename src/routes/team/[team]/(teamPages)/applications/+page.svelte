<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ApplicationOrderField } from '$houdini';
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
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';
	//import Status from '$lib/Status.svelte';
	//import InstanceStatus from '../../[env]/app/[app]/InstanceStatus.svelte';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ Workloads } = data);

	$: tableSort = {
		orderBy: $Workloads.variables?.orderBy?.field,
		direction: $Workloads.variables?.orderBy?.direction
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
			tableSort.orderBy = ApplicationOrderField[key as keyof typeof ApplicationOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || ApplicationOrderField.NAME
		});
	};
</script>

{#if $Workloads.errors}
	<Alert variant="error">
		{#each $Workloads.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $Workloads.data}
	{@const team = $Workloads.data.team}
	<div class="grid">
		<Card columns={12}>
			<Table
				zebraStripes
				size="small"
				sort={{
					orderBy: tableSort.orderBy || ApplicationOrderField.NAME,
					direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
				}}
				on:sortChange={tableSortChange}
			>
				<Thead>
					<Th sortable={true} sortKey={ApplicationOrderField.STATUS} style="width: 2rem"></Th>
					<Th sortable={true} sortKey={ApplicationOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={ApplicationOrderField.ENVIRONMENT} style="width: 2rem"
						>Env</Th
					>
					<Th style="width: 2rem">Critical</Th>
					<Th style="width: 8rem;">Risk score</Th>
					<Th style="width: 200px">Instances</Th>
					<Th sortable={true} sortKey={ApplicationOrderField.DEPLOYMENT_TIME} style="width: 150px"
						>Deployed</Th
					>
				</Thead>
				<Tbody>
					{#if team !== undefined}
						{#each team.applications.edges as edge}
							<Tr>
								<Td>
									<div class="status">
										<a
											href="/team/{teamName}/{edge.node.environment.name}/app/{edge.node
												.name}/status"
											data-sveltekit-preload-data="off"
										>
											TODO<!--Status size="1.5rem" state={edge.node.status.state} /-->
										</a>
									</div>
								</Td>
								<Td>
									<a href="/team/{teamName}/{edge.node.environment.name}/app/{edge.node.name}"
										>{edge.node.name}</a
									>
								</Td>
								<Td>{edge.node.environment.name}</Td>
								<Td style="text-align: center;">
									<Button
										as="a"
										variant="tertiary-neutral"
										size="small"
										href="/team/{teamName}/{edge.node.environment.name}/app/{edge.node.name}/image"
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
										href="/team/{teamName}/{edge.node.environment.name}/app/{edge.node.name}/image"
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
									<!--InstanceStatus app={edge.node} /-->
								</Td>
								<Td>
									<!--
										{#if edge.node.deployInfo.timestamp}
											<Time time={edge.node.deployInfo.timestamp} distance={true} />
										{/if}-->
									TODO
								</Td>
							</Tr>
						{:else}
							<Tr>
								<Td colspan={999}>No apps found</Td>
							</Tr>
						{/each}
					{/if}
				</Tbody>
			</Table>
			{#if $Workloads.data?.team.applications.pageInfo.hasPreviousPage || $Workloads.data?.team.applications.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if $Workloads.data.team.applications.pageInfo.pageStart !== $Workloads.data.team.applications.pageInfo.pageEnd}
							{$Workloads.data.team.applications.pageInfo.pageStart} - {$Workloads.data.team
								.applications.pageInfo.pageEnd}
						{:else}
							{$Workloads.data.team.applications.pageInfo.pageStart}
						{/if}

						of {$Workloads.data.team.applications.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!$Workloads.data.team.applications.pageInfo.hasPreviousPage}
							on:click={async () => {
								return await Workloads.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!$Workloads.data.team.applications.pageInfo.hasNextPage}
							on:click={async () => {
								return await Workloads.loadNextPage();
							}}
						>
							<ChevronRightIcon /></Button
						>
					</span>
				</div>
			{/if}
		</Card>
		<!--ActivityLog {teamName} resourceType={AuditEventResourceType.APP} columns={12} /-->
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
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
