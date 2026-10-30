<script lang="ts">
	import { page } from '$app/state';
	import { OrderDirection, SqlInstanceOrderField } from '$houdini';
	import { docURL } from '#lib/doc.js';
	import IssueSeverityTags from '#lib/domain/issues/IssueSeverityTags.svelte';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import OrderByMenu from '#lib/ui/OrderByMenu.svelte';
	import ResourceTable from '#lib/ui/ResourceTable.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import StatusIndicator from '#lib/ui/StatusIndicator.svelte';
	import { countIssuesBySeverity } from '#lib/utils/issueCounts.js';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { Loader, Tag, Td, Th, Tr, type TableSortState } from '#lib/shadcn/ui/index.js';
	import { DatabaseIcon } from '#lib/icons/index.js';
	import type { PageProps } from './$types';

	type SqlOrderFieldOptions = (typeof SqlInstanceOrderField)[keyof typeof SqlInstanceOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();

	let { SqlInstances } = $derived(data);

	const currentSortField: SqlOrderFieldOptions = $derived(
		(Object.values(SqlInstanceOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as SqlOrderFieldOptions | undefined) ?? SqlInstanceOrderField.ISSUES
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			OrderDirectionOptions | undefined) ?? OrderDirection.DESC
	);

	const tableSort: TableSortState = $derived({
		orderBy: currentSortField,
		direction: currentSortDirection === OrderDirection.ASC ? 'ascending' : 'descending'
	});

	function setSort(key: string) {
		const field = Object.values(SqlInstanceOrderField).find((field) => field === key);
		if (!field) throw new Error(`Unsupported Cloud SQL sort field: ${key}`);
		const defaultDirection =
			field === SqlInstanceOrderField.NAME ||
			field === SqlInstanceOrderField.ENVIRONMENT ||
			field === SqlInstanceOrderField.STATE ||
			field === SqlInstanceOrderField.VERSION
				? OrderDirection.ASC
				: OrderDirection.DESC;
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: defaultDirection;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' });
	}
</script>

<GraphErrors errors={$SqlInstances.errors} />

{#if $SqlInstances.fetching}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if $SqlInstances.data}
	{const si = $derived($SqlInstances.data.team.sqlInstances)}

	<Collection
		title="Cloud SQL"
		icon={DatabaseIcon}
		headerBorder={false}
		count={si.pageInfo.totalCount}
	>
		{#snippet actions()}
			<OrderByMenu
				orderField={SqlInstanceOrderField}
				defaultOrderField={SqlInstanceOrderField.ISSUES}
				defaultOrderDirection={OrderDirection.DESC}
			/>
		{/snippet}
		{#if si.pageInfo.totalCount > 0}
			<ResourceTable label="Cloud SQL" sort={tableSort} onsortchange={setSort}>
				{#snippet header()}
					<Th class="status-column" sortable sortKey={SqlInstanceOrderField.STATE}>Status</Th>
					<Th sortable sortKey={SqlInstanceOrderField.NAME}>Name</Th>
					<Th sortable sortKey={SqlInstanceOrderField.ENVIRONMENT}>Env</Th>
					<Th sortable sortKey={SqlInstanceOrderField.ISSUES}>Issues</Th>
					<Th sortable sortKey={SqlInstanceOrderField.VERSION}>Version</Th>
					<Th>Owner</Th>
				{/snippet}
				{#each si.edges as { node: instance } (instance.id)}
					<Tr>
						<Td>
							<div class="status-cell">
								<StatusIndicator
									label={instance.state}
									tone={instance.state === 'RUNNABLE'
										? 'success'
										: instance.state === 'FAILED'
											? 'danger'
											: instance.state === 'MAINTENANCE'
												? 'warning'
												: instance.state === 'UNSPECIFIED'
													? 'neutral'
													: 'info'}
								/>
							</div>
						</Td>
						<Td>
							<a
								class="resource-name"
								href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
									.name}/cloudsql/{instance.name}">{instance.name}</a
							>
						</Td>
						<Td>
							<Tag size="xsmall" variant={envTagVariant(instance.teamEnvironment.environment.name)}
								>{instance.teamEnvironment.environment.name}</Tag
							>
						</Td>
						<Td>
							{#if (instance.issues?.pageInfo.totalCount ?? 0) > 0}
								{const criticalCount = $derived(
									countIssuesBySeverity(instance.issues?.edges, 'CRITICAL')
								)}
								{const warningCount = $derived(
									countIssuesBySeverity(instance.issues?.edges, 'WARNING')
								)}
								{const todoCount = $derived(countIssuesBySeverity(instance.issues?.edges, 'TODO'))}

								<IssueSeverityTags
									critical={criticalCount}
									warning={warningCount}
									todo={todoCount}
								/>
							{/if}
						</Td>
						<Td><span class="table-meta">{instance.version}</span></Td>
						<Td>
							{#if instance.workload}
								<WorkloadLink workload={instance.workload} hideTeam hideEnv />
							{/if}
						</Td>
					</Tr>
				{/each}
			</ResourceTable>
		{:else}
			<p>
				No Cloud SQL instances found. Cloud SQL instances provide managed relational databases in
				the cloud.
				<ExternalLink href={docURL('/persistence/cloudsql')}
					>Learn more about Cloud SQL in Nais and how to get started.</ExternalLink
				>
			</p>
		{/if}
	</Collection>

	<Pagination
		page={si.pageInfo}
		loaders={{
			loadPreviousPage: () =>
				changeParams({ after: '', before: si.pageInfo.startCursor ?? '' }, { noScroll: true }),
			loadNextPage: () =>
				changeParams({ before: '', after: si.pageInfo.endCursor ?? '' }, { noScroll: true })
		}}
	/>
{/if}
