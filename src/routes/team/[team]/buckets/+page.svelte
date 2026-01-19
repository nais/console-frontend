<script lang="ts">
	import { BucketOrderField, OrderDirection } from '$houdini';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import CdnBucket from '$lib/domain/persistence/CDNBucket.svelte';
	import PersistenceCost from '$lib/domain/cost/PersistenceCost.svelte';
	import PersistenceLink from '$lib/domain/persistence/PersistenceLink.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Tag } from '@nais/ds-svelte-community';
	import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Buckets, userIsMember } = $derived(data);

	let cost = $derived(() => {
		const costData = $Buckets.data?.team.cost;
		const teamSlug = $Buckets.data?.team.slug;

		if (!costData || !teamSlug) return null;

		return {
			costData,
			teamSlug,
			pageName: 'Buckets'
		};
	});
</script>

<GraphErrors errors={$Buckets.errors} />

{#if $Buckets.data}
	{#if $Buckets.data.team.buckets.pageInfo.totalCount || $Buckets.data.team.externalResources.cdn?.bucket}
		<div class="content-wrapper">
			<div>
				<BodyLong spacing>
					Storage buckets are containers for storing and managing data in the cloud.
					<ExternalLink href={docURL('/persistence/buckets')}
						>Learn more about Buckets and how to get started.</ExternalLink
					>
				</BodyLong>

				{#if $Buckets.data.team.buckets.pageInfo.totalCount}
					<List title="{$Buckets.data.team.buckets.pageInfo.totalCount} entries">
						{#snippet menu()}
							<OrderByMenu
								orderField={BucketOrderField}
								defaultOrderField={BucketOrderField.NAME}
								defaultOrderDirection={OrderDirection.DESC}
							/>
						{/snippet}
						{#each $Buckets.data.team.buckets.nodes as instance (instance.id)}
							<ListItem>
								<div>
									<PersistenceLink {instance} />
									<Tag
										size="small"
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
				{/if}
			</div>
			<div class="right-column">
				{#if cost()}
					{@const costData = cost()!}
					<div>
						<PersistenceCost
							pageName={costData.pageName}
							costData={costData.costData}
							teamSlug={costData.teamSlug}
							from={startOfMonth(subMonths(new Date(), 1))}
							to={endOfYesterday()}
							service="Cloud Storage"
						/>
					</div>
				{/if}
				{#if $Buckets.data.team.externalResources.cdn?.bucket && userIsMember}
					<div>
						<CdnBucket cdnBucket={$Buckets.data.team.externalResources.cdn.bucket} />
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="content-wrapper">
			<BodyLong>
				<strong>No Buckets found.</strong> Storage buckets are containers for storing and managing
				data in the cloud.
				<ExternalLink href={docURL('/persistence/buckets')}>
					Learn more about Buckets and how to get started.
				</ExternalLink>
			</BodyLong>
			<div class="right-column">
				{#if $Buckets.data.team.externalResources.cdn?.bucket && userIsMember}
					<div>
						<CdnBucket cdnBucket={$Buckets.data.team.externalResources.cdn.bucket} />
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<style>
		.content-wrapper {
			display: grid;
			gap: var(--ax-space-24);
			grid-template-columns: 1fr 300px;
		}
		.right {
			display: flex;
			gap: var(--ax-space-6);
			align-items: center;
		}

		.right-column {
			display: grid;
			gap: var(--ax-space-24);
		}
	</style>
{/if}
