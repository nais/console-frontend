<script lang="ts">
	import CvesGroupedByPriority from '#lib/domain/vulnerability/CvesGroupedByPriority.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { BodyLong, Heading, Loader } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { CvePriorityGroups } = $derived(data);
	const groups = $derived([
		{ key: 'high', priority: 'HIGH', connection: $CvePriorityGroups.data?.high },
		{ key: 'elevated', priority: 'ELEVATED', connection: $CvePriorityGroups.data?.elevated },
		{ key: 'monitor', priority: 'MONITOR', connection: $CvePriorityGroups.data?.monitor }
	]);
	const hasCves = $derived(
		groups.some((group) => (group.connection?.pageInfo.totalCount ?? 0) > 0)
	);
</script>

<div class="wrapper">
	<GraphErrors errors={$CvePriorityGroups.errors} />
	<div>
		<Heading as="h2" spacing>CVE Database</Heading>
		<BodyLong>
			Browse the complete list of Common Vulnerabilities and Exposures (CVEs) affecting your
			workloads. Each CVE entry includes severity, threat signals, and the number of affected
			workloads.
		</BodyLong>
	</div>

	{#if $CvePriorityGroups.fetching && !$CvePriorityGroups.data}
		<div class="loading-centered" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else if hasCves}
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
							fetching={$CvePriorityGroups.fetching}
							loaders={{
								loadPreviousPage: () =>
									changeParams(
										{
											[`${group.key}Before`]: group.connection?.pageInfo.startCursor ?? '',
											[`${group.key}After`]: ''
										},
										{ noScroll: true }
									),
								loadNextPage: () =>
									changeParams(
										{
											[`${group.key}After`]: group.connection?.pageInfo.endCursor ?? '',
											[`${group.key}Before`]: ''
										},
										{ noScroll: true }
									)
							}}
						/>
					{/snippet}
				</CvesGroupedByPriority>
			{/if}
		{/each}
	{:else if !$CvePriorityGroups.errors}
		<BodyLong>No CVEs found.</BodyLong>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
</style>
