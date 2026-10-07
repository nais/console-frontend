<script lang="ts">
	import CvesGroupedByPriority from '#lib/domain/vulnerability/CvesGroupedByPriority.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import OrderByMenu from '#lib/ui/OrderByMenu.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { CVEOrderField, OrderDirection } from '$houdini';
	import { BodyLong, Heading, Loader } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import { cvePageParams } from './pagination.js';

	let { data }: PageProps = $props();
	let { CvePriorityGroups, CveList } = $derived(data);
	const query = $derived(data.grouped ? $CvePriorityGroups : $CveList);
	const flatConnection = $derived($CveList?.data?.cves);
	const priorityGroups = $derived([
		{ key: 'high', priority: 'HIGH', connection: $CvePriorityGroups?.data?.high },
		{ key: 'elevated', priority: 'ELEVATED', connection: $CvePriorityGroups?.data?.elevated },
		{ key: 'monitor', priority: 'MONITOR', connection: $CvePriorityGroups?.data?.monitor }
	] as const);
	const groups = $derived(
		data.cveOrder === 'PRIORITY-DESC' ? priorityGroups.toReversed() : priorityGroups
	);
	const hasCves = $derived(
		groups.some((group) => (group.connection?.pageInfo.totalCount ?? 0) > 0)
	);
</script>

<div class="wrapper">
	<GraphErrors errors={query?.errors} />
	<div>
		<div class="cve-header">
			<Heading as="h2">CVE Database</Heading>
			<OrderByMenu
				orderField={CVEOrderField}
				defaultOrderField={CVEOrderField.PRIORITY}
				defaultOrderDirection={OrderDirection.ASC}
			/>
		</div>
		<BodyLong>
			Browse the complete list of Common Vulnerabilities and Exposures (CVEs) affecting your
			workloads. Each CVE entry includes severity, threat signals, and the number of affected
			workloads.
		</BodyLong>
	</div>

	{#if query?.fetching && !query.data}
		<div class="loading-centered" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else if data.grouped && hasCves}
		{#each groups as group (group.key)}
			{#if group.connection && group.connection.pageInfo.totalCount > 0}
				<CvesGroupedByPriority
					cves={group.connection.edges}
					priorityGroup={{
						priority: group.priority,
						totalCount: group.connection.pageInfo.totalCount
					}}
				>
					{#snippet pagination()}
						<Pagination
							page={group.connection?.pageInfo}
							fetching={query?.fetching}
							loaders={{
								loadPreviousPage: () =>
									changeParams(
										cvePageParams(
											group.key,
											'previous',
											group.connection?.pageInfo.startCursor ?? null,
											data.cveOrder
										),
										{ noScroll: true }
									),
								loadNextPage: () =>
									changeParams(
										cvePageParams(
											group.key,
											'next',
											group.connection?.pageInfo.endCursor ?? null,
											data.cveOrder
										),
										{ noScroll: true }
									)
							}}
						/>
					{/snippet}
				</CvesGroupedByPriority>
			{/if}
		{/each}
	{:else if !data.grouped && flatConnection && flatConnection.pageInfo.totalCount > 0}
		<CvesGroupedByPriority cves={flatConnection.edges} flat />
		<Pagination
			page={flatConnection.pageInfo}
			fetching={query?.fetching}
			loaders={{
				loadPreviousPage: () =>
					changeParams(
						cvePageParams(
							'all',
							'previous',
							flatConnection?.pageInfo.startCursor ?? null,
							data.cveOrder
						),
						{ noScroll: true }
					),
				loadNextPage: () =>
					changeParams(
						cvePageParams('all', 'next', flatConnection?.pageInfo.endCursor ?? null, data.cveOrder),
						{ noScroll: true }
					)
			}}
		/>
	{:else if !query?.errors}
		<BodyLong>No CVEs found.</BodyLong>
	{/if}
</div>

<style>
	.cve-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
		margin-bottom: var(--ax-space-12);
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
</style>
