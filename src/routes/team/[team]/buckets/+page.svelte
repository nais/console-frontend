<script lang="ts">
	import { page } from '$app/state';
	import { BucketOrderField, OrderDirection } from '$houdini';
	import { docURL } from '$lib/doc';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import WorkloadListFilters from '$lib/domain/workload/WorkloadListFilters.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Tag } from '@nais/ds-svelte-community';
	import { BucketIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	type BucketOrderFieldOptions = (typeof BucketOrderField)[keyof typeof BucketOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();
	let { Buckets } = $derived(data);

	const sortFields: { value: BucketOrderFieldOptions; label: string }[] = [
		{ value: BucketOrderField.NAME, label: 'Name' },
		{ value: BucketOrderField.ENVIRONMENT, label: 'Environment' }
	];

	const currentSortField: BucketOrderFieldOptions = $derived(
		(Object.values(BucketOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as BucketOrderFieldOptions | undefined) ?? BucketOrderField.NAME
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function setSort(field: BucketOrderFieldOptions) {
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: OrderDirection.ASC;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' });
	}

	const selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);

	function handleEnvironmentsChange(selected: string[]) {
		changeParams({ environments: selected.join(','), after: '', before: '' }, { noScroll: true });
	}
</script>

<GraphErrors errors={$Buckets.errors} />

{#if $Buckets.data}
	<div class="layout-two-column">
		<div>
			<List title="Buckets" count={$Buckets.data.team.buckets.pageInfo.totalCount}>
				{#if $Buckets.data.team.buckets.nodes.length > 0}
					{#each $Buckets.data.team.buckets.nodes as instance (instance.id)}
						<ListItem interactive>
							<div class="name-group">
								<BucketIcon style="font-size: 1.25rem; flex-shrink: 0" />
								<a
									href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
										.name}/bucket/{instance.name}"
									class="item-name">{instance.name}</a
								>
								<Tag
									size="xsmall"
									variant={envTagVariant(instance.teamEnvironment.environment.name)}
									>{instance.teamEnvironment.environment.name}</Tag
								>
							</div>
							{#if instance.workload}
								<div class="right">
									Owner: <WorkloadLink workload={instance.workload} hideTeam hideEnv />
								</div>
							{/if}
						</ListItem>
					{/each}
				{:else}
					<ListItem>
						<p>
							No buckets found. Storage buckets are containers for storing and managing data in the
							cloud.
							<ExternalLink href={docURL('/persistence/buckets')}
								>Learn more about Buckets and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/if}
			</List>
			<Pagination
				page={$Buckets.data.team.buckets.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeParams(
							{
								after: '',
								before: $Buckets.data?.team.buckets.pageInfo.startCursor ?? ''
							},
							{ noScroll: true }
						),
					loadNextPage: () =>
						changeParams(
							{ before: '', after: $Buckets.data?.team.buckets.pageInfo.endCursor ?? '' },
							{ noScroll: true }
						)
				}}
			/>
		</div>
		<div class="layout-sidebar">
			<SurfaceCard title="Filters">
				<WorkloadListFilters
					{sortFields}
					{currentSortField}
					{currentSortDirection}
					environments={$Buckets.data?.team.buckets.facets?.environments ?? []}
					{selectedEnvironments}
					onSort={(field) => setSort(field as BucketOrderFieldOptions)}
					onEnvironmentsChange={handleEnvironmentsChange}
				/>
			</SurfaceCard>
		</div>
	</div>
{/if}

<style>
	.right {
		display: flex;
		gap: var(--ax-space-6);
		align-items: center;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.right {
			align-self: flex-end;
			justify-content: flex-end;
			margin-top: var(--ax-space-6);
		}
	}

	.name-group {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		min-width: 0;
	}
	.name-group :global(.aksel-tag) {
		white-space: nowrap;
		flex-shrink: 0;
	}
	.item-name {
		color: var(--ax-text-neutral);
		text-decoration: none;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		flex: 0 1 auto;
	}
	.item-name:hover {
		text-decoration: underline;
	}
</style>
