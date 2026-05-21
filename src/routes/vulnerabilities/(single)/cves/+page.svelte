<script lang="ts">
	import { page } from '$app/state';
	import { CVEOrderField, OrderDirection } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { severityToVariant } from '$lib/utils/vulnerabilities';
	import {
		BodyLong,
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
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { CVES } = $derived(data);

	const currentOrderField = $derived(
		urlToOrderField(CVEOrderField, CVEOrderField.CVSS_SCORE, page.url)
	);

	const currentOrderDirection = $derived(urlToOrderDirection(page.url, OrderDirection.DESC));

	const tableSortState = $derived.by(
		(): TableSortState => ({
			orderBy: currentOrderField,
			direction: currentOrderDirection === OrderDirection.ASC ? 'ascending' : 'descending'
		})
	);

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
		<div class="table-scroll" role="region" aria-label="CVE database">
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
					{#if $CVES.fetching}
						<Tr>
							<Td colspan={999}>
								<div class="loading-centered" role="status" aria-label="Loading">
									<Loader size="3xlarge" />
								</div>
							</Td>
						</Tr>
					{:else}
						{#each $CVES.data?.cves.nodes ?? [] as cve (cve.identifier)}
							<Tr>
								<Td>
									<a href="/vulnerabilities/{cve.identifier}">{cve.identifier}</a>
								</Td>
								<Td>
									<Tag variant={severityToVariant(cve.severity)} size="small"
										>{cve.severity.toLowerCase()}</Tag
									>
								</Td>
								<Td>{cve.cvssScore?.toFixed(1) ?? 'N/A'}</Td>
								<Td>{cve.title}</Td>
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

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
</style>
