<script lang="ts">
	import { page } from '$app/state';
	import { CVEOrderField, OrderDirection } from '$houdini';
	import PriorityBadge from '$lib/domain/vulnerability/priority/PriorityBadge.svelte';
	import PrioritySignals from '$lib/domain/vulnerability/priority/PrioritySignals.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { severityToVariant } from '$lib/utils/vulnerabilities';
	import {
		BodyLong,
		Detail,
		Heading,
		Loader,
		Table,
		Tag,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community';
	import { ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { CVES } = $derived(data);

	const currentOrderField = $derived(
		urlToOrderField(CVEOrderField, CVEOrderField.PRIORITY, page.url)
	);

	const currentOrderDirection = $derived(urlToOrderDirection(page.url, OrderDirection.DESC));

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

	// The API only supports a single sort field and no filtering, so this page
	// can only group/sort the page of CVEs it has already loaded — not the full
	// tenant-wide total. Same reasoning as the workload-level KEV/priority
	// groupings elsewhere: correct for what's visible, not a global count.
	const sortedEdges = $derived.by(() => {
		const edges = $CVES.data?.cves.edges ?? [];
		if (currentOrderField !== CVEOrderField.PRIORITY) return edges;
		return [...edges].sort(
			(a, b) => (severityRank[b.node.severity] ?? -1) - (severityRank[a.node.severity] ?? -1)
		);
	});

	const knownExploitedEdges = $derived(sortedEdges.filter(({ node }) => node.hasKevEntry));
	const highEdges = $derived(sortedEdges.filter(({ node }) => node.priority === 'HIGH'));
	const elevatedEdges = $derived(sortedEdges.filter(({ node }) => node.priority === 'ELEVATED'));
	const monitorEdges = $derived(sortedEdges.filter(({ node }) => node.priority === 'MONITOR'));

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
</script>

{#snippet cveRows(edges: typeof sortedEdges)}
	<div class="table-scroll" role="region" aria-label="CVE list">
		<Table size="small" sort={tableSortState} onsortchange={handleSortChange}>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={CVEOrderField.IDENTIFIER}>CVE</Th>
					<Th sortable={true} sortKey={CVEOrderField.SEVERITY}>Severity</Th>
					<Th sortable={true} sortKey={CVEOrderField.CVSS_SCORE}>CVSS</Th>
					<Th>Title</Th>
					<Th sortable={true} sortKey={CVEOrderField.AFFECTED_WORKLOADS_COUNT}>Workloads</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each edges as { node: cve } (cve.identifier)}
					<Tr>
						<Td>
							<a href="/vulnerabilities/{cve.identifier}">{cve.identifier}</a>
						</Td>
						<Td>
							<Tag variant={severityToVariant(cve.severity)} size="small"
								>{cve.severity.toLowerCase()}</Tag
							>
						</Td>
						<Td>{cve.cvssScore ? cve.cvssScore.toFixed(1) : '—'}</Td>
						<Td>
							<div class="title-cell">
								<span>{cve.title}</span>
								<PrioritySignals
									hasKevEntry={cve.hasKevEntry}
									knownRansomwareUse={cve.knownRansomwareUse}
									epssScore={cve.epssScore}
									epssPercentile={cve.epssPercentile}
								/>
							</div>
						</Td>
						<Td>{cve.workloads.pageInfo.totalCount}</Td>
					</Tr>
				{:else}
					<Tr>
						<Td colspan={999}>No CVEs in this group on the current page.</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	</div>
{/snippet}

<div class="wrapper">
	<GraphErrors errors={$CVES.errors} />
	<div>
		<Heading as="h2" spacing>CVE Database</Heading>
		<BodyLong>
			Browse the complete list of Common Vulnerabilities and Exposures (CVEs) affecting your
			workloads. Each CVE entry includes severity rating, CVSS score, description, and the number of
			affected workloads.
		</BodyLong>
	</div>

	{#if $CVES.fetching && !$CVES.data}
		<div class="loading-centered" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else}
		<Detail>
			Grouped by priority for the CVEs currently loaded below — counts reflect this page, not the
			full database.
		</Detail>

		<div class="priority-groups">
			{#if knownExploitedEdges.length > 0}
				<details class="priority-group" open>
					<summary>
						<ChevronRightIcon class="chevron" aria-hidden="true" />
						<Tag variant="error" size="small">Known exploited</Tag>
						<span class="group-count">{knownExploitedEdges.length} on this page</span>
					</summary>
					{@render cveRows(knownExploitedEdges)}
				</details>
			{/if}

			<details class="priority-group">
				<summary>
					<ChevronRightIcon class="chevron" aria-hidden="true" />
					<PriorityBadge priority="HIGH" />
					<span class="group-count">{highEdges.length} on this page</span>
				</summary>
				{@render cveRows(highEdges)}
			</details>

			<details class="priority-group">
				<summary>
					<ChevronRightIcon class="chevron" aria-hidden="true" />
					<PriorityBadge priority="ELEVATED" />
					<span class="group-count">{elevatedEdges.length} on this page</span>
				</summary>
				{@render cveRows(elevatedEdges)}
			</details>

			<details class="priority-group">
				<summary>
					<ChevronRightIcon class="chevron" aria-hidden="true" />
					<PriorityBadge priority="MONITOR" />
					<span class="group-count">{monitorEdges.length} on this page</span>
				</summary>
				{@render cveRows(monitorEdges)}
			</details>
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

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}

	.title-cell {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		min-width: 18rem;
	}

	.priority-groups {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.priority-group {
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-8);
		padding: var(--ax-space-12);
	}

	.priority-group summary {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
		cursor: pointer;
		list-style: none;
	}

	.priority-group summary::-webkit-details-marker {
		display: none;
	}

	.priority-group summary :global(.chevron) {
		transition: transform 120ms ease;
		flex-shrink: 0;
	}

	.priority-group[open] summary :global(.chevron) {
		transform: rotate(90deg);
	}

	.priority-group[open] summary {
		margin-bottom: var(--ax-space-12);
	}

	.group-count {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}
</style>
