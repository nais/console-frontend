<script lang="ts">
	import CveListView from '#lib/domain/vulnerability/CveList.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import OrderByMenu from '#lib/ui/OrderByMenu.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { BodyLong, Heading, Loader } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';
	import {
		cveOrderFields,
		cvePageParams,
		cvePaginationParams,
		defaultCveOrder
	} from './pagination.js';

	let { data }: PageProps = $props();
	let { CveList } = $derived(data);
	const query = $derived($CveList);
	const connection = $derived(query.data?.cves);
</script>

<div class="wrapper">
	<GraphErrors errors={query?.errors} />
	<div>
		<div class="cve-header">
			<Heading as="h2">CVE Database</Heading>
			<OrderByMenu
				orderField={cveOrderFields}
				defaultOrderField={defaultCveOrder.field}
				defaultOrderDirection={defaultCveOrder.direction}
				resetParams={cvePaginationParams}
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
	{:else if connection && connection.pageInfo.totalCount > 0}
		<CveListView cves={connection.edges} />
		<Pagination
			page={connection.pageInfo}
			fetching={query?.fetching}
			loaders={{
				loadPreviousPage: () =>
					changeParams(
						cvePageParams('previous', connection?.pageInfo.startCursor ?? null, data.cveOrder),
						{ noScroll: true }
					),
				loadNextPage: () =>
					changeParams(
						cvePageParams('next', connection?.pageInfo.endCursor ?? null, data.cveOrder),
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
		gap: var(--nais-space-8);
		margin-bottom: var(--nais-space-12);
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
</style>
