<script lang="ts">
	import { goto } from '$app/navigation';
	import { graphql } from '$houdini';
	import BulkSuppressCVE, {
		type BulkSuppressWorkload
	} from '$lib/domain/vulnerability/BulkSuppressCVE.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { suppressionStateLabels } from '$lib/utils/vulnerabilities';
	import {
		Alert,
		BodyShort,
		Box,
		Button,
		Checkbox,
		Detail,
		Heading,
		Loader,
		Search,
		Tag
	} from '@nais/ds-svelte-community';
	import { MagnifyingGlassIcon } from '@nais/ds-svelte-community/icons';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamCVEDetails, TeamCVEWorkloads, teamSlug } = $derived(data);

	let searchValue = $state('');
	let selectedIds = new SvelteSet<string>();
	let bulkOpen = $state(false);

	const rowKey = (node: { id: string }) => node.id;

	const teamRoles = graphql(`
		query TeamCVEPageTeamRoles($team: Slug!) @cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				viewerIsMember
			}
		}
	`);

	$effect(() => {
		teamRoles.fetch({ variables: { team: teamSlug } });
	});

	const viewerIsMember = $derived($teamRoles.data?.team.viewerIsMember ?? false);

	const handleSearch = async (event: SubmitEvent) => {
		event.preventDefault();
		const identifier = searchValue.trim();
		if (identifier) {
			searchValue = '';
			await goto(
				`/team/${encodeURIComponent(teamSlug)}/vulnerabilities/${encodeURIComponent(identifier)}`
			);
		}
	};

	const isNotFoundError = (errors?: { message: string }[] | null) => {
		return errors?.some((e) => e.message.includes('cve not found'));
	};

	const hasOtherErrors = (errors?: { message: string }[] | null) => {
		return errors?.some((e) => !e.message.includes('cve not found'));
	};

	const hasDetailsLink = (detailsLink?: string | null) => {
		return Boolean(detailsLink?.trim());
	};

	const toggleSelect = (vulnId: string) => {
		const nodes = $TeamCVEWorkloads.data?.cve.workloads.nodes ?? [];
		const group = nodes.filter((n) => n.vulnerability.id === vulnId);
		if (group.every((n) => selectedIds.has(n.id))) {
			group.forEach((n) => selectedIds.delete(n.id));
		} else {
			group.forEach((n) => selectedIds.add(n.id));
		}
	};

	const selectableNodes = $derived.by(() => {
		const nodes = $TeamCVEWorkloads.data?.cve.workloads.nodes ?? [];
		const suppressedVulnIds = new Set(
			nodes.filter((n) => n.vulnerability.suppression).map((n) => n.vulnerability.id)
		);
		return nodes.filter((n) => !suppressedVulnIds.has(n.vulnerability.id));
	});

	const toggleAll = () => {
		if (allSelected(selectableNodes)) {
			selectableNodes.forEach((n) => selectedIds.delete(rowKey(n)));
		} else {
			selectableNodes.forEach((n) => selectedIds.add(rowKey(n)));
		}
	};

	const allSelected = (nodes: { id: string }[]) => {
		return nodes.length > 0 && nodes.every((n) => selectedIds.has(rowKey(n)));
	};

	const anySelected = (nodes: { id: string }[]) => {
		return nodes.some((n) => selectedIds.has(rowKey(n)));
	};

	type VulnGroup = {
		vulnerabilityId: string;
		package: string;
		suppression: (typeof $TeamCVEWorkloads)['data'] extends infer D
			? D extends { cve: { workloads: { nodes: Array<infer N> } } }
				? N extends { vulnerability: { suppression: infer S } }
					? S
					: never
				: never
			: never;
		nodes: NonNullable<
			NonNullable<(typeof $TeamCVEWorkloads)['data']>['cve']['workloads']['nodes']
		>;
	};

	const groupedWorkloads = $derived.by((): VulnGroup[] => {
		const nodes = $TeamCVEWorkloads.data?.cve.workloads.nodes ?? [];
		const map = new SvelteMap<string, VulnGroup>();
		for (const node of nodes) {
			const vid = node.vulnerability.id;
			if (!map.has(vid)) {
				map.set(vid, {
					vulnerabilityId: vid,
					package: node.vulnerability.package,
					suppression: node.vulnerability.suppression ?? null,
					nodes: []
				});
			}
			map.get(vid)!.nodes.push(node);
		}
		return [...map.values()];
	});

	const isGroupSelected = (group: VulnGroup) => group.nodes.every((n) => selectedIds.has(n.id));

	const isGroupPartial = (group: VulnGroup) =>
		group.nodes.some((n) => selectedIds.has(n.id)) && !isGroupSelected(group);

	const bulkWorkloads = $derived.by((): BulkSuppressWorkload[] => {
		const nodes = $TeamCVEWorkloads.data?.cve.workloads.nodes ?? [];
		return nodes
			.filter((n) => selectedIds.has(rowKey(n)))
			.map((n) => ({
				rowKey: rowKey(n),
				vulnerabilityId: n.vulnerability.id,
				workloadName: n.workload.name,
				teamSlug: n.workload.team.slug,
				environmentName: n.workload.teamEnvironment.environment.name,
				package: n.vulnerability.package
			}));
	});

	const onSuppressed = () => {
		selectedIds.clear();
		TeamCVEWorkloads.fetch({ policy: 'NetworkOnly' });
	};
</script>

<div class="container">
	<form class="search-form" onsubmit={handleSearch}>
		<div class="search-input">
			<Search
				label="Search for vulnerability"
				placeholder="Enter vulnerability ID (e.g., CVE-2024-1234)"
				bind:value={searchValue}
				variant="simple"
				hideLabel={false}
				size="small"
				name="vulnerability"
			/>
		</div>
		<Button type="submit" variant="primary" size="small" icon={MagnifyingGlassIcon}>Search</Button>
	</form>

	{#if $TeamCVEDetails.fetching}
		<div class="loading" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else if isNotFoundError($TeamCVEDetails.errors)}
		<Alert variant="warning" size="medium">
			Vulnerability not found. The ID you entered doesn't exist in our database.
		</Alert>
	{:else if $TeamCVEDetails.data}
		{@const cve = $TeamCVEDetails.data.cve}
		<div class="wrapper">
			{#if cve.title}
				<BodyShort>{cve.title}</BodyShort>
			{/if}

			<section aria-labelledby="cve-details">
				<Heading as="h2" size="small" spacing id="cve-details">Details</Heading>
				<dl class="details-list">
					{#if cve.cvssScore}
						<div>
							<Detail as="dt">CVSS Score</Detail>
							<BodyShort as="dd"><strong>{cve.cvssScore.toFixed(1)}</strong></BodyShort>
						</div>
					{/if}
					<div>
						<Detail as="dt">Severity</Detail>
						<BodyShort as="dd">
							<span
								class="severity-badge {cve.severity}"
								style="font-size: var(--ax-font-size-small)">{cve.severity}</span
							>
						</BodyShort>
					</div>
					<div>
						<Detail as="dt">More Information</Detail>
						<BodyShort as="dd">
							{#if hasDetailsLink(cve.detailsLink)}
								<ExternalLink href={cve.detailsLink}>View full details</ExternalLink>
							{:else}
								No link available
							{/if}
						</BodyShort>
					</div>
				</dl>
			</section>
		</div>
	{:else if hasOtherErrors($TeamCVEDetails.errors)}
		<GraphErrors errors={$TeamCVEDetails.errors} />
	{/if}

	{#if !isNotFoundError($TeamCVEWorkloads.errors)}
		<div>
			<div class="workloads-header">
				<Heading as="h2" size="small" spacing>
					Affected Workloads
					{#if $TeamCVEWorkloads.data?.cve.workloads.pageInfo.totalCount ?? 0 > 0}
						<span class="count">({$TeamCVEWorkloads.data?.cve.workloads.pageInfo.totalCount})</span>
					{/if}
				</Heading>
				{#if viewerIsMember && bulkWorkloads.length > 0}
					<Button
						variant="primary"
						size="small"
						onclick={() => {
							bulkOpen = true;
						}}
					>
						Suppress {bulkWorkloads.length} selected
					</Button>
				{/if}
			</div>

			{#if viewerIsMember}
				<BodyShort>
					Select workloads to suppress this vulnerability. Suppressed findings will be excluded from
					vulnerability reports.
				</BodyShort>
			{/if}

			{#if $TeamCVEWorkloads.fetching}
				<div class="loading" role="status" aria-label="Loading">
					<Loader size="3xlarge" />
				</div>
			{:else if $TeamCVEWorkloads.data}
				{@const workloads = $TeamCVEWorkloads.data.cve.workloads}
				{#if workloads.nodes.length > 0}
					{#if viewerIsMember}
						<div class="select-all-row">
							<Checkbox
								checked={allSelected(selectableNodes)}
								indeterminate={anySelected(selectableNodes) && !allSelected(selectableNodes)}
								onchange={() => toggleAll()}
								disabled={selectableNodes.length === 0}
								readonly={selectableNodes.length === 0}
							>
								Select all for this team ({selectableNodes.length} workload{selectableNodes.length !==
								1
									? 's'
									: ''} with this vulnerability that are not already suppressed)
							</Checkbox>
						</div>
					{/if}
					<div class="vulnerability-groups">
						{#each groupedWorkloads as group (group.vulnerabilityId)}
							<Box
								borderRadius="12"
								padding="space-16"
								borderColor="neutral-subtleA"
								borderWidth="1"
							>
								<div class="vuln-group-header">
									{#if viewerIsMember}
										<Checkbox
											checked={isGroupSelected(group)}
											indeterminate={isGroupPartial(group)}
											onchange={() => {
												if (!group.suppression) toggleSelect(group.vulnerabilityId);
											}}
											disabled={!!group.suppression}
											readonly={!!group.suppression}
											hideLabel
										>
											Select all workloads with package {group.package}
										</Checkbox>
									{/if}
									<div class="vuln-group-content">
										<div class="vuln-group-title">
											<BodyShort><strong><code>{group.package}</code></strong></BodyShort>
											{#if group.suppression}
												<Tag variant="neutral" size="small">
													{suppressionStateLabels[group.suppression.state] ?? 'Suppressed'}
												</Tag>
											{/if}
										</div>
										<dl class="vuln-group-meta">
											{#if group.nodes[0]?.workload.image}
												<div>
													<Detail as="dt">Image</Detail>
													<Detail as="dd"
														><code
															>{group.nodes[0].workload.image.name}:{group.nodes[0].workload.image
																.tag}</code
														></Detail
													>
												</div>
											{/if}
											<div>
												<Detail as="dt">Workloads</Detail>
												<Detail as="dd">{group.nodes.length} affected</Detail>
											</div>
										</dl>
									</div>
								</div>
								<ul class="vuln-group-workloads">
									{#each group.nodes as node (node.id)}
										{@const workload = node.workload}
										<li>
											<WorkloadLink {workload} />
										</li>
									{/each}
								</ul>
							</Box>
						{/each}
					</div>
				{:else}
					<BodyShort>No workloads are currently affected by this vulnerability.</BodyShort>
				{/if}
			{:else if hasOtherErrors($TeamCVEWorkloads.errors)}
				<GraphErrors errors={$TeamCVEWorkloads.errors} />
			{/if}
		</div>
	{/if}
</div>

{#if viewerIsMember && $TeamCVEDetails.data}
	<BulkSuppressCVE
		bind:open={bulkOpen}
		cveIdentifier={$TeamCVEDetails.data.cve.identifier}
		workloads={bulkWorkloads}
		onsuppressed={onSuppressed}
	/>
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-32);
	}

	.search-form {
		display: flex;
		gap: var(--ax-space-12);
		align-items: flex-end;
		max-width: 600px;
	}

	@media (max-width: 767px) {
		.search-form {
			flex-direction: column;
			align-items: stretch;
		}
	}

	.search-input {
		flex: 1;
		min-width: 0;
		align-items: flex-start;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.details-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-24);
		margin: 0;
		align-items: stretch;

		& > div {
			display: grid;
			grid-template-rows: auto 1fr;
			gap: var(--ax-space-4);
		}

		& > div :global(dd) {
			display: flex;
			align-items: center;
			margin: 0;
		}
	}

	.count {
		font-weight: normal;
		color: var(--ax-text-neutral);
	}

	.workloads-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-12);
		flex-wrap: wrap;
		margin-bottom: var(--ax-space-8);
	}

	.select-all-row {
		margin-bottom: var(--ax-space-8);
	}

	.vulnerability-groups {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.vuln-group-header {
		display: flex;
		align-items: flex-start;
		gap: var(--ax-space-8);
	}

	.vuln-group-content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		flex: 1;
	}

	.vuln-group-title {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
		flex-wrap: wrap;
	}

	.vuln-group-meta {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-4) var(--ax-space-12);
		margin: 0;

		& > div {
			display: grid;
			grid-template-columns: subgrid;
			grid-column: 1 / -1;
			align-items: baseline;
		}

		& :global(dt) {
			font-weight: var(--ax-font-weight-bold);
			color: var(--ax-text-neutral-subtle);
		}

		& :global(dd) {
			margin: 0;
		}
	}

	.vuln-group-workloads {
		list-style: none;
		margin: var(--ax-space-16) 0 0;
		padding: var(--ax-space-12) 0 0;
		border-top: 1px solid var(--ax-border-neutral-subtleA);
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.vuln-group-workload {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
	}

	code {
		font-size: 0.9rem;
		word-break: break-all;
	}
</style>
