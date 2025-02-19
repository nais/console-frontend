<script lang="ts">
	import { BucketOrderField } from '$houdini';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import PersistenceCost from '$lib/components/PersistenceCost.svelte';
	import PersistenceLink from '$lib/components/PersistenceLink.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { BodyLong, Detail } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Buckets } = $derived(data);
</script>

<GraphErrors errors={$Buckets.errors} />

{#if $Buckets.data}
	{@const cost = $Buckets.data.team.cost}
	{@const buckets = $Buckets.data.team.buckets}

	{#if buckets.nodes.length > 0 || $Buckets.data.team.totalCount.pageInfo.totalCount > 0}
		<div class="content-wrapper">
			<div>
				<BodyLong spacing>
					Storage buckets are containers for storing and managing data in the cloud.
					<a href="https://docs.nais.io/persistence/buckets"
						>Learn more about Buckets and how to get started.</a
					>
				</BodyLong>
				<List title="{buckets.pageInfo.totalCount} entries">
					{#snippet menu()}
						<OrderByMenu OrderField={BucketOrderField} defaultOrderField={BucketOrderField.NAME} />
					{/snippet}
					{#each buckets.nodes as instance (instance.id)}
						<ListItem>
							<div>
								<PersistenceLink {instance} />
								<Detail>{instance.environment.name}</Detail>
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
					page={buckets.pageInfo}
					loaders={{
						loadPreviousPage: () =>
							changeParams({ after: '', before: buckets.pageInfo.startCursor ?? '' }),
						loadNextPage: () =>
							changeParams({ before: '', after: buckets.pageInfo.endCursor ?? '' })
					}}
				/>
			</div>
			<PersistenceCost
				costData={cost}
				title="Bucket cost"
				from={$Buckets.variables?.from ?? new Date()}
				to={$Buckets.variables?.to ?? new Date()}
				teamSlug={$Buckets.data?.team.slug}
			/>
		</div>
	{:else}
		<BodyLong>
			<strong>No Buckets found.</strong> Storage buckets are containers for storing and managing
			data in the cloud.
			<a href="https://docs.nais.io/persistence/buckets">
				Learn more about Buckets and how to get started.
			</a>
		</BodyLong>
	{/if}
{/if}

<style>
	.content-wrapper {
		display: grid;
		gap: var(--a-spacing-6);
		grid-template-columns: 1fr 300px;
	}
	.right {
		display: flex;
		gap: var(--a-spacing-1-alt);
		align-items: center;
	}
</style>
