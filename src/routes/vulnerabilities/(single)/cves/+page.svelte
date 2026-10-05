<script lang="ts">
	import CvesGroupedByPriority from '#lib/domain/vulnerability/CvesGroupedByPriority.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { urlToOrderField } from '#lib/ui/OrderByMenu.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { page } from '$app/state';
	import { CVEOrderField } from '$houdini';
	import { BodyLong, Heading, Loader } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { CVES } = $derived(data);

	const currentOrderField = $derived(
		urlToOrderField(CVEOrderField, CVEOrderField.PRIORITY, page.url)
	);

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
	{:else}
		<CvesGroupedByPriority cves={sortedEdges} />
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
</style>
