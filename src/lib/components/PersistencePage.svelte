<script lang="ts" generics="T extends OrderField">
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import OrderByMenu, { type OrderField } from '$lib/components/OrderByMenu.svelte';
	import PersistenceCost, { type CostData } from '$lib/components/PersistenceCost.svelte';
	import PersistenceLink from '$lib/components/PersistenceLink.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Detail } from '@nais/ds-svelte-community';
	import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
	import type { Snippet } from 'svelte';

	let {
		description,
		notFound,
		costData,
		list,
		pageInfo,
		orderField,
		defaultOrderField,
		teamSlug,
		pageName
	}: {
		description: Snippet;
		notFound: Snippet;
		costData: CostData;
		list: {
			readonly id: string;
			readonly __typename: string | null;
			readonly name: string;
			readonly environment: {
				readonly name: string;
			};
			readonly team: {
				readonly slug: string;
			};
			readonly workload: {
				readonly __typename: string | null;
				readonly name: string;
				readonly environment: {
					readonly name: string;
				};
				readonly team: {
					readonly slug: string;
				};
			} | null;
		}[];
		pageInfo: {
			readonly hasNextPage: boolean;
			readonly hasPreviousPage: boolean;
			readonly pageStart: number;
			readonly pageEnd: number;
			readonly totalCount: number;
			readonly startCursor: string | null;
			readonly endCursor: string | null;
		};
		orderField: T;
		defaultOrderField: T[keyof T];
		teamSlug: string;
		pageName: string;
	} = $props();
</script>

{#if pageInfo.totalCount}
	<div class="content-wrapper">
		<div>
			{@render description()}
			<List title="{pageInfo.totalCount} entries">
				{#snippet menu()}
					<OrderByMenu {orderField} {defaultOrderField} />
				{/snippet}
				{#each list as instance (instance.id)}
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
				page={pageInfo}
				loaders={{
					loadPreviousPage: () => changeParams({ after: '', before: pageInfo.startCursor ?? '' }),
					loadNextPage: () => changeParams({ before: '', after: pageInfo.endCursor ?? '' })
				}}
			/>
		</div>
		<PersistenceCost
			{costData}
			title="{pageName} cost"
			from={startOfMonth(subMonths(new Date(), 1))}
			to={endOfYesterday()}
			{teamSlug}
		/>
	</div>
{:else}
	{@render notFound()}
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
