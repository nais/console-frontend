<script lang="ts">
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import { BodyLong, BodyShort, Detail, Heading, Loader, Tag } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { CVEDetails } = $derived(data);
</script>

<div class="page">
	<div class="container">
		<GraphErrors errors={$CVEDetails.errors} />

		{#if $CVEDetails.fetching}
			<div class="loading">
				<Loader size="3xlarge" />
			</div>
		{:else if $CVEDetails.data}
			{@const cve = $CVEDetails.data.cve}
			<div class="wrapper">
				<div class="header">
					<div class="title-row">
						<Heading level="1" size="large">{cve.identifier}</Heading>
						<Tag
							variant="neutral"
							style="background-color: {severityToColor({ severity: cve.severity.toLowerCase() })};"
						>
							{cve.severity}
						</Tag>
					</div>
					{#if cve.title}
						<BodyLong>{cve.title}</BodyLong>
					{/if}
				</div>

				<div class="card">
					<Heading level="2" size="small" spacing>Details</Heading>
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
								<Tag
									size="small"
									variant="neutral"
									style="background-color: {severityToColor({
										severity: cve.severity.toLowerCase()
									})};"
								>
									{cve.severity}
								</Tag>
							</BodyShort>
						</div>
						<div>
							<Detail as="dt">More Information</Detail>
							<BodyShort as="dd">
								<ExternalLink href={cve.detailsLink}>View full details</ExternalLink>
							</BodyShort>
						</div>
					</dl>
				</div>

				{#if cve.description}
					<div class="card">
						<Heading level="2" size="small" spacing>Description</Heading>
						<BodyLong>{cve.description}</BodyLong>
					</div>
				{/if}

				<Heading level="2" size="small">
					Affected Workloads
					{#if cve.workloads.pageInfo.totalCount > 0}
						<span class="count">({cve.workloads.pageInfo.totalCount})</span>
					{/if}
				</Heading>

				{#if cve.workloads.nodes.length > 0}
					<List>
						{#each cve.workloads.nodes as node (node.workload.name + node.workload.team.slug + node.workload.teamEnvironment.environment.name)}
							{@const workload = node.workload}
							{@const vuln = node.vulnerability}
							<ListItem>
								<div class="workload-row">
									<WorkloadLink {workload} />
									<div class="vuln-info">
										<div>
											<Detail>Package</Detail>
											<BodyShort size="small"><code>{vuln.package}</code></BodyShort>
										</div>
										{#if workload.image}
											<div>
												<Detail>Image</Detail>
												<BodyShort size="small">
													<code class="truncate">{workload.image.name}:{workload.image.tag}</code>
												</BodyShort>
											</div>
										{/if}
									</div>
								</div>
							</ListItem>
						{/each}
					</List>
					<Pagination
						page={cve.workloads.pageInfo}
						fetching={$CVEDetails.fetching}
						loaders={{
							loadPreviousPage: () =>
								changeParams(
									{
										after: '',
										before: cve.workloads.pageInfo.startCursor ?? ''
									},
									{ noScroll: true }
								),
							loadNextPage: () =>
								changeParams(
									{
										after: cve.workloads.pageInfo.endCursor ?? '',
										before: ''
									},
									{ noScroll: true }
								)
						}}
					/>
				{:else}
					<BodyShort>No workloads are currently affected by this vulnerability.</BodyShort>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 500px;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: var(--ax-space-16);
	}

	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-24);
		border-radius: 12px;
	}

	.details-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-24);
		margin: 0;
	}

	.count {
		font-weight: normal;
		color: var(--ax-text-neutral);
	}

	.workload-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--ax-space-16);
		flex-wrap: wrap;
	}

	.vuln-info {
		display: flex;
		gap: var(--ax-space-24);
	}

	.truncate {
		max-width: 250px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
	}
</style>
