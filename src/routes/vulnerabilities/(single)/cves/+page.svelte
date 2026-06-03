<script lang="ts">
	import { page } from '$app/state';
	import { graphql, CVEOrderField, OrderDirection } from '$houdini';
	import PriorityBadge from '$lib/domain/vulnerability/PriorityBadge.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyShort,
		BodyLong,
		Detail,
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
	import { SvelteMap } from 'svelte/reactivity';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { CVES } = $derived(data);

	const tierOrder = ['IMMEDIATE', 'HIGH', 'ELEVATED', 'MONITOR'] as const;

	type CveNode = NonNullable<NonNullable<NonNullable<typeof $CVES.data>['cves']>['nodes']>[number];

	const tierLabels: Record<(typeof tierOrder)[number], string> = {
		IMMEDIATE: 'Act now',
		HIGH: 'High',
		ELEVATED: 'Elevated',
		MONITOR: 'Monitor'
	};

	const cveTierTotals = graphql(`
		query CVETierTotals($first: Int!, $after: Cursor) {
			cves(first: $first, after: $after, orderBy: { field: IDENTIFIER, direction: ASC }) {
				pageInfo {
					hasNextPage
					endCursor
				}
				nodes {
					id
					priority
					workloads {
						pageInfo {
							totalCount
						}
					}
				}
			}
		}
	`);

	let tierSummaries = $state(
		tierOrder.map((tier) => ({
			tier,
			label: tierLabels[tier],
			cves: 0,
			workloads: 0
		}))
	);

	let tierSummaryLoading = $state(false);

	const currentOrderField = $derived(
		urlToOrderField(CVEOrderField, CVEOrderField.PRIORITY, page.url)
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

	const compareText = (a: string, b: string) =>
		a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

	const compareNumber = (a: number | null | undefined, b: number | null | undefined) =>
		(a ?? -1) - (b ?? -1);

	const compareCves = (a: CveNode, b: CveNode) => {
		const direction = currentOrderDirection === OrderDirection.ASC ? 1 : -1;

		switch (currentOrderField) {
			case CVEOrderField.IDENTIFIER:
				return direction * compareText(a.identifier, b.identifier);
			case CVEOrderField.AFFECTED_WORKLOADS_COUNT:
				return (
					direction *
						compareNumber(a.workloads.pageInfo.totalCount, b.workloads.pageInfo.totalCount) ||
					compareText(a.identifier, b.identifier)
				);
			case CVEOrderField.CVSS_SCORE:
				return (
					direction * compareNumber(a.cvssScore, b.cvssScore) ||
					direction * compareNumber(a.epssScore, b.epssScore) ||
					compareText(a.identifier, b.identifier)
				);
			case CVEOrderField.SEVERITY:
				return (
					direction * compareText(a.severity, b.severity) || compareText(a.identifier, b.identifier)
				);
			case CVEOrderField.PRIORITY:
			default:
				return (
					direction * compareNumber(a.cvssScore, b.cvssScore) ||
					direction * compareNumber(a.epssScore, b.epssScore) ||
					compareText(a.identifier, b.identifier)
				);
		}
	};

	const groupedCves = $derived.by(() => {
		const groups = new SvelteMap<string, CveNode[]>();
		for (const tier of tierOrder) {
			groups.set(tier, []);
		}

		for (const cve of $CVES.data?.cves.nodes ?? []) {
			const tier = cve.priority;
			if (!groups.has(tier)) {
				groups.set(tier, []);
			}
			groups.get(tier)?.push(cve);
		}

		for (const tier of tierOrder) {
			groups.get(tier)?.sort(compareCves);
		}

		return tierOrder
			.map((tier) => ({ tier, nodes: groups.get(tier) ?? [] }))
			.filter((group) => group.nodes.length > 0);
	});

	$effect(() => {
		let cancelled = false;

		const loadTierSummaries = async () => {
			tierSummaryLoading = true;
			const byTier = new SvelteMap<string, { cves: number; workloads: number }>();
			for (const tier of tierOrder) {
				byTier.set(tier, { cves: 0, workloads: 0 });
			}

			let after: string | null = null;
			let hasNextPage = true;

			while (hasNextPage && !cancelled) {
				await cveTierTotals.fetch({
					policy: 'NetworkOnly',
					variables: {
						first: 50,
						after
					}
				});

				const connection = $cveTierTotals.data?.cves;
				for (const cve of connection?.nodes ?? []) {
					const current = byTier.get(cve.priority);
					if (!current) continue;
					current.cves += 1;
					current.workloads += cve.workloads.pageInfo.totalCount;
				}

				hasNextPage = connection?.pageInfo.hasNextPage ?? false;
				after = connection?.pageInfo.endCursor ?? null;
			}

			if (cancelled) return;

			tierSummaries = tierOrder.map((tier) => ({
				tier,
				label: tierLabels[tier],
				cves: byTier.get(tier)?.cves ?? 0,
				workloads: byTier.get(tier)?.workloads ?? 0
			}));
			tierSummaryLoading = false;
		};

		void loadTierSummaries();

		return () => {
			cancelled = true;
		};
	});

	const explainPriority = (cve: CveNode) => {
		if (cve.hasKevEntry) {
			return 'Marked Act now because this CVE appears in KEV.';
		}
		if (cve.knownRansomwareUse) {
			return 'Marked high priority due to known ransomware use.';
		}
		if ((cve.epssPercentile ?? 0) >= 0.9) {
			return `Marked ${tierLabels[cve.priority].toLowerCase()} due to high EPSS percentile.`;
		}
		if (cve.cvssScore != null) {
			return `Marked ${tierLabels[cve.priority].toLowerCase()} with CVSS ${cve.cvssScore.toFixed(1)}.`;
		}

		return `Marked ${tierLabels[cve.priority].toLowerCase()} based on backend risk tier.`;
	};
</script>

<div class="wrapper">
	<GraphErrors errors={$CVES.errors} />
	<div>
		<Heading as="h2" spacing>CVE Database</Heading>
		<BodyLong>
			Browse CVEs grouped by risk tier to prioritize remediation. Severity details are available in
			the advanced section for each CVE.
		</BodyLong>
		<details class="security-terms" aria-label="Security scoring terms">
			<summary>Info: Security scoring terms</summary>
			<div class="security-terms-content">
				<p><strong>CVE</strong>: Public identifier for a known vulnerability.</p>
				<p><strong>CVSS</strong>: Severity score from 0 to 10 (higher means more severe).</p>
				<p>
					<strong>EPSS</strong>: Probability of exploitation in the wild (0 to 1). Data source:
					<a href="https://www.first.org/epss/" target="_blank" rel="noreferrer">FIRST EPSS</a>.
				</p>
				<p><strong>EPSS percentile</strong>: How this EPSS compares to other CVEs.</p>
				<p>
					<strong>KEV</strong>: Listed in CISA Known Exploited Vulnerabilities catalog.
					<a
						href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
						target="_blank"
						rel="noreferrer">View KEV catalog</a
					>.
				</p>
			</div>
		</details>
	</div>

	<div class="tier-overview" aria-label="CVE risk tier overview">
		{#each tierSummaries as tier (tier.tier)}
			<div class="tier-card">
				<div class="tier-card-header">
					<PriorityBadge priority={tier.tier} size="small" />
				</div>
				<Heading as="h3" size="xsmall">{tier.cves} CVE{tier.cves === 1 ? '' : 's'}</Heading>
				<BodyShort size="small" textColor="subtle">{tier.workloads} affected workloads</BodyShort>
				{#if tierSummaryLoading}
					<BodyShort size="small" textColor="subtle"
						>Calculating total across all pages...</BodyShort
					>
				{/if}
			</div>
		{/each}
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
						<Th sortable={true} sortKey={CVEOrderField.PRIORITY}>Priority</Th>
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
						{#each groupedCves as group (group.tier)}
							<Tr>
								<Td colspan={999}>
									<div class="tier-header">
										<PriorityBadge priority={group.tier} size="small" />
										<span>{group.nodes.length} CVE{group.nodes.length === 1 ? '' : 's'}</span>
									</div>
								</Td>
							</Tr>
							{#each group.nodes as cve (cve.identifier)}
								<Tr>
									<Td>
										<div class="cve-cell">
											<a href="/vulnerabilities/{cve.identifier}">{cve.identifier}</a>
											<BodyShort size="small" textColor="subtle" class="explainability-text"
												>{explainPriority(cve)}</BodyShort
											>
											<details class="advanced-details">
												<summary>Advanced / Severity</summary>
												<dl class="advanced-list">
													<div>
														<Detail as="dt">Severity</Detail>
														<BodyShort as="dd">{cve.severity}</BodyShort>
													</div>
													<div>
														<Detail as="dt">CVSS score</Detail>
														<BodyShort as="dd">{cve.cvssScore?.toFixed(1) ?? 'N/A'}</BodyShort>
													</div>
													<div>
														<Detail as="dt">EPSS</Detail>
														<BodyShort as="dd">{cve.epssScore?.toFixed(4) ?? 'N/A'}</BodyShort>
													</div>
													<div>
														<Detail as="dt">EPSS percentile</Detail>
														<BodyShort as="dd"
															>{cve.epssPercentile != null
																? `${Math.round(cve.epssPercentile * 100)}%`
																: 'N/A'}</BodyShort
														>
													</div>
													<div>
														<Detail as="dt">KEV</Detail>
														<BodyShort as="dd">{cve.hasKevEntry ? 'Yes' : 'No'}</BodyShort>
													</div>
													<div>
														<Detail as="dt">Ransomware use</Detail>
														<BodyShort as="dd"
															>{cve.knownRansomwareUse ? 'Known' : 'Not known'}</BodyShort
														>
													</div>
													<div>
														<Detail as="dt">Details</Detail>
														<BodyShort as="dd"
															>{#if cve.detailsLink}<a href={cve.detailsLink}>Open source details</a
																>{:else}N/A{/if}</BodyShort
														>
													</div>
												</dl>
											</details>
										</div>
									</Td>
									<Td>
										<PriorityBadge priority={cve.priority} size="small" />
									</Td>
									<Td>{cve.title}</Td>
									<Td>{cve.workloads.pageInfo.totalCount}</Td>
								</Tr>
							{/each}
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

	.security-terms {
		margin-top: var(--ax-space-12);
		padding: var(--ax-space-12);
		border-radius: var(--ax-radius-8);
		border: 1px solid var(--ax-border-neutral-subtleA);
		background: color-mix(in srgb, var(--ax-neutral-100) 60%, transparent);
		color: var(--ax-text-neutral);
		font-size: var(--ax-font-size-small);
	}

	.security-terms summary {
		cursor: pointer;
		font-weight: var(--ax-font-weight-bold);
	}

	.security-terms-content {
		margin-top: var(--ax-space-8);
		display: grid;
		gap: var(--ax-space-6);
	}

	.security-terms-content p {
		margin: 0;
	}

	.tier-overview {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--ax-space-8);
	}

	.tier-card {
		display: grid;
		gap: var(--ax-space-4);
		padding: var(--ax-space-12);
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-8);
		background: color-mix(in srgb, var(--ax-neutral-100) 50%, transparent);
	}

	.tier-card-header {
		display: flex;
		justify-content: flex-start;
	}

	.tier-header {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.cve-cell {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	.advanced-details summary {
		cursor: pointer;
		color: var(--ax-text-subtle);
		font-size: var(--ax-font-size-small);
	}

	.advanced-list {
		display: grid;
		grid-template-columns: minmax(12ch, 20ch) minmax(0, 1fr);
		gap: var(--ax-space-4) var(--ax-space-12);
		margin-top: var(--ax-space-4);
	}

	.advanced-list div {
		display: contents;
	}

	.advanced-list :global(dt) {
		margin: 0;
		color: var(--ax-text-subtle);
	}

	.advanced-list :global(dd) {
		margin: 0;
		color: var(--ax-text-neutral);
	}

	@media (max-width: 767px) {
		.tier-overview {
			grid-template-columns: 1fr 1fr;
		}

		.advanced-list {
			grid-template-columns: 1fr;
			gap: var(--ax-space-2);
		}

		.advanced-list :global(dd) {
			margin-bottom: var(--ax-space-6);
		}
	}
</style>
