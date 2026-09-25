<script lang="ts">
	import { page } from '$app/state';
	import { CVEOrderField, OrderDirection } from '$houdini';
	import PriorityBadge from '$lib/domain/vulnerability/priority/PriorityBadge.svelte';
	import PrioritySignals from '$lib/domain/vulnerability/priority/PrioritySignals.svelte';
	import CvesCardGrid from '$lib/domain/vulnerability/prototype/CvesCardGrid.svelte';
	import CvesGroupedByPriority from '$lib/domain/vulnerability/prototype/CvesGroupedByPriority.svelte';
	import PrototypeSwitcher from '$lib/domain/vulnerability/prototype/PrototypeSwitcher.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Loader,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { CVES } = $derived(data);

	const currentOrderField = $derived(
		urlToOrderField(CVEOrderField, CVEOrderField.PRIORITY, page.url)
	);

	const currentOrderDirection = $derived(urlToOrderDirection(page.url, OrderDirection.ASC));

	const tableSortState = $derived.by((): TableSortState => ({
		orderBy: currentOrderField,
		direction: currentOrderDirection === OrderDirection.ASC ? 'ascending' : 'descending'
	}));

	const severityRank: Record<string, number> = {
		CRITICAL: 4,
		HIGH: 3,
		MEDIUM: 2,
		LOW: 1,
		UNASSIGNED: 0
	};

	const sortedEdges = $derived.by(() => {
		const edges = $CVES.data?.cves.edges ?? [];
		if (currentOrderField !== CVEOrderField.PRIORITY) return edges;

		const firstIndexForPriority: Record<string, number> = {};
		edges.forEach((edge, index) => {
			if (!(edge.node.riskAssessment.priority in firstIndexForPriority)) {
				firstIndexForPriority[edge.node.riskAssessment.priority] = index;
			}
		});

		return [...edges].sort((a, b) => {
			const priorityDiff =
				(firstIndexForPriority[a.node.riskAssessment.priority] ?? 0) -
				(firstIndexForPriority[b.node.riskAssessment.priority] ?? 0);
			if (priorityDiff !== 0) return priorityDiff;
			return (severityRank[b.node.severity] ?? -1) - (severityRank[a.node.severity] ?? -1);
		});
	});

	const handleSortChange = (key: string) => {
		const nextDirection =
			currentOrderField === key
				? currentOrderDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: key === CVEOrderField.IDENTIFIER
					? OrderDirection.ASC
					: OrderDirection.DESC;

		changeParams(
			{
				sort: `${key}-${nextDirection}`,
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	};

	const views = ['table', 'cards', 'grouped'] as const;
	const viewLabels: Record<string, string> = {
		table: 'Table (current)',
		cards: 'Card grid',
		grouped: 'Grouped by priority'
	};
	let view = $derived(
		(views as readonly string[]).includes(page.url.searchParams.get('view') ?? '')
			? (page.url.searchParams.get('view') as (typeof views)[number])
			: 'table'
	);
</script>

<div class="wrapper">
	<GraphErrors errors={$CVES.errors} />
	<div>
		<Heading as="h2" spacing>CVE Database</Heading>
		<BodyLong>
			Browse the complete list of Common Vulnerabilities and Exposures (CVEs) affecting your
			workloads. Each CVE entry includes severity, threat signals, and the number of affected
			workloads.
		</BodyLong>
	</div>

	{#if $CVES.fetching && !$CVES.data}
		<div class="loading-centered" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else if view === 'cards'}
		<CvesCardGrid cves={sortedEdges} />
	{:else if view === 'grouped'}
		<CvesGroupedByPriority cves={sortedEdges} />
	{:else}
		<div class="table-scroll" role="region" aria-label="CVE database">
			<Table size="small" sort={tableSortState} onsortchange={handleSortChange}>
				<Thead>
					<Tr>
						<Th sortable={true} sortKey={CVEOrderField.IDENTIFIER}>CVE</Th>
						<Th sortable={true} sortKey={CVEOrderField.PRIORITY}>Priority</Th>
						<Th sortable={true} sortKey={CVEOrderField.SEVERITY}>Severity</Th>
						<Th>Title</Th>
						<Th>Threat signals</Th>
						<Th sortable={true} sortKey={CVEOrderField.AFFECTED_WORKLOADS_COUNT}>Workloads</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#if $CVES.fetching}
						<Tr>
							<Td colspan={999}>
								<div class="loading-centered" role="status" aria-label="Loading">
									<Loader size="3xlarge" />
								</div>
							</Td>
						</Tr>
					{:else}
						{#each sortedEdges as { node: cve } (cve.identifier)}
							<Tr>
								<Td>
									<a href="/vulnerabilities/{cve.identifier}">{cve.identifier}</a>
								</Td>
								<Td><PriorityBadge priority={cve.riskAssessment.priority} /></Td>
								<Td>
									<span class="severity-badge {cve.severity}">{cve.severity}</span>
								</Td>
								<Td>
									<span>{cve.title}</span>
								</Td>
								<Td>
									<PrioritySignals
										hasKevEntry={cve.riskAssessment.hasKevEntry}
										knownRansomwareUse={cve.riskAssessment.knownRansomwareUse}
										epssScore={cve.riskAssessment.epssScore}
										epssPercentile={cve.riskAssessment.epssPercentile}
										showEmpty
										showHelpText={false}
									/>
								</Td>
								<Td>{cve.workloads.pageInfo.totalCount}</Td>
							</Tr>
						{:else}
							<Tr>
								<Td colspan={999}>No CVEs found.</Td>
							</Tr>
						{/each}
					{/if}
				</Tbody>
			</Table>
		</div>
	{/if}

	<Pagination
		page={$CVES.data?.cves.pageInfo}
		fetching={$CVES.fetching}
		loaders={{
			loadPreviousPage: () =>
				changeParams(
					{
						before: $CVES.data?.cves.pageInfo.startCursor ?? '',
						after: ''
					},
					{ noScroll: true }
				),
			loadNextPage: () =>
				changeParams(
					{
						after: $CVES.data?.cves.pageInfo.endCursor ?? '',
						before: ''
					},
					{ noScroll: true }
				)
		}}
	/>
</div>

{#if import.meta.env.DEV}
	<PrototypeSwitcher variants={views} current={view} labels={viewLabels} paramName="view" />
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
</style>
