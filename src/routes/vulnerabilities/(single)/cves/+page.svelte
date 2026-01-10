<script lang="ts">
	import { CVEOrderField, OrderDirection } from '$houdini';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { severityToVariant } from '$lib/utils/vulnerabilities';
	import { BodyLong, BodyShort, Detail, Heading, Loader, Tag } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { CVES } = $derived(data);
</script>

<div class="wrapper">
	<div>
		<Heading level="2" as="h2" spacing>CVE Database</Heading>
		<BodyLong spacing>
			Browse the complete list of Common Vulnerabilities and Exposures (CVEs) affecting your
			workloads. Each CVE entry includes severity rating, CVSS score, description, and the number of
			affected workloads.
		</BodyLong>
	</div>

	<List title="CVEs">
		{#snippet menu()}
			<OrderByMenu
				orderField={CVEOrderField}
				defaultOrderField={CVEOrderField.CVSS_SCORE}
				defaultOrderDirection={OrderDirection.DESC}
			/>
		{/snippet}
		{#if $CVES.fetching}
			<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
				<Loader size="3xlarge" />
			</div>
		{:else if $CVES.data?.cves.nodes}
			{#each $CVES.data.cves.nodes as cve (cve.identifier)}
				<ListItem href="/vulnerabilities/{cve.identifier}">
					<div class="cve-row">
						<div class="cve-main">
							<div class="cve-id-section">
								<BodyShort weight="semibold">{cve.identifier}</BodyShort>
								<Tag variant={severityToVariant(cve.severity)} size="small">{cve.severity}</Tag>
							</div>
							<Detail>{cve.title}</Detail>
						</div>
						<div class="cve-stats">
							<div class="cve-stat">
								<Detail textColor="subtle">CVSS:</Detail>
								<Detail>{cve.cvssScore?.toFixed(1) ?? 'N/A'}</Detail>
							</div>
							<div class="cve-stat">
								<Detail textColor="subtle">Workloads:</Detail>
								<Detail>{cve.workloads.pageInfo.totalCount}</Detail>
							</div>
						</div>
					</div>
				</ListItem>
			{/each}
		{:else}
			<div style="text-align: center; padding: 2rem;">
				<Detail>No CVEs found</Detail>
			</div>
		{/if}
	</List>

	{#if $CVES.data?.cves.pageInfo}
		<Pagination
			page={$CVES.data.cves.pageInfo}
			loaders={{
				loadPreviousPage: () => {
					changeParams(
						{
							before: $CVES.data?.cves.pageInfo.startCursor ?? '',
							after: ''
						},
						{ noScroll: true }
					);
				},
				loadNextPage: () => {
					changeParams(
						{
							after: $CVES.data?.cves.pageInfo.endCursor ?? '',
							before: ''
						},
						{ noScroll: true }
					);
				}
			}}
			fetching={$CVES.fetching}
		/>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}

	.cve-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		width: 100%;
	}

	.cve-main {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.cve-id-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.cve-stats {
		display: flex;
		gap: 1rem;
		flex-shrink: 0;
	}

	.cve-stat {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}
</style>
