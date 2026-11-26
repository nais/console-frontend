<script lang="ts">
	import PrioritySignals from '#lib/domain/vulnerability/priority/PrioritySignals.svelte';
	import V0sCveNavigation from '#lib/domain/vulnerability/V0sCveNavigation.svelte';
	import V0sCveTeamScope from '#lib/domain/vulnerability/V0sCveTeamScope.svelte';
	import {
		v0sCveCursor,
		v0sCveOrderFields,
		v0sCveTeamScope
	} from '#lib/domain/vulnerability/v0sCve.js';
	import { Alert, Heading, Table, Tbody, Td, Th, Thead, Tr } from '#lib/shadcn/ui/index.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import OrderByMenu from '#lib/ui/OrderByMenu.svelte';
	import { numberFormatter } from '#lib/utils/formatters.js';
	import { page } from '$app/state';
	import LegacyCveListPage from './LegacyCveListPage.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const store = $derived(data.v0s ? data.V0sCveList : undefined);
	const connection = $derived($store?.data?.vulnerabilityFindings.vulnerabilities);
	const coverage = $derived($store?.data?.vulnerabilityFindings.summary.coverage);
</script>

{#if data.v0s}
	<section aria-labelledby="cve-list-title" class="v0s-list">
		<Heading as="h2" id="cve-list-title">
			CVE Database {connection ? `(${numberFormatter(connection.pageInfo.totalCount)})` : ''}
		</Heading>
		<div class="controls">
			<V0sCveTeamScope />
			<OrderByMenu
				orderField={v0sCveOrderFields}
				defaultOrderField="SEVERITY"
				defaultOrderDirection="DESC"
				resetParams={[v0sCveCursor]}
			/>
		</div>
		<GraphErrors errors={$store?.errors} />
		{#if connection && !$store?.errors?.length}
			{#if coverage && coverage.scanned < coverage.totalWorkloads}
				<Alert variant="warning">
					Scan coverage is incomplete. Results only reflect available scans.
				</Alert>
			{/if}
			{#if connection.nodes.length}
				<div class="table-scroll">
					<Table size="small">
						<Thead>
							<Tr
								><Th>Identifier</Th><Th>Title</Th><Th>Severity</Th><Th>Threat signals</Th><Th
									>Affected workloads</Th
								></Tr
							>
						</Thead>
						<Tbody>
							{#each connection.nodes as entry (entry.vulnerabilityIdentifier)}
								<Tr>
									<Td
										><a
											href="/vulnerabilities/{encodeURIComponent(
												entry.vulnerabilityIdentifier
											)}{v0sCveTeamScope(page.url) ? '?myTeams=true' : ''}"
											>{entry.vulnerabilityIdentifier}</a
										></Td
									>
									<Td>{entry.vulnerability?.title || '—'}</Td>
									<Td><span class="severity-badge {entry.severity}">{entry.severity}</span></Td>
									<Td
										><PrioritySignals
											hasKevEntry={entry.vulnerability?.knownExploited ?? false}
											epssScore={entry.vulnerability?.epss?.score ?? null}
											showHelpText={false}
										/></Td
									>
									<Td>{numberFormatter(entry.affectedWorkloadCount)}</Td>
								</Tr>
							{/each}
						</Tbody>
					</Table>
				</div>
			{:else}
				<p>{connection.pageInfo.totalCount ? 'No CVEs on this page.' : 'No CVEs found.'}</p>
			{/if}
		{/if}
		<V0sCveNavigation pageInfo={connection?.pageInfo} />
	</section>
{:else}
	<LegacyCveListPage {data} />
{/if}

<style>
	.v0s-list {
		display: grid;
		gap: var(--nais-space-16);
		margin-top: var(--spacing-layout);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--nais-space-8);
	}
</style>
