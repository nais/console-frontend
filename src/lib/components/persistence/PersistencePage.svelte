<script lang="ts" generics="T extends OrderField">
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import OrderByMenu, { type OrderField } from '$lib/components/OrderByMenu.svelte';
	import PersistenceCost, {
		type CostData
	} from '$lib/components/persistence/PersistenceCost.svelte';
	import PersistenceLink from '$lib/components/persistence/PersistenceLink.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Tag } from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
	import type { Snippet } from 'svelte';
	import CdnBucket from './CDNBucket.svelte';

	let {
		description,
		notFound,
		cdnBucket,
		cost,
		list,
		pageInfo,
		orderField,
		defaultOrderField,
		viewerIsMember,
		create
	}: {
		description: Snippet;
		notFound: Snippet;
		cdnBucket?: string;
		viewerIsMember?: boolean;
		cost?: {
			costData: CostData;
			teamSlug: string;
			pageName: string;
		};
		create?: {
			buttonText: string;
			url: string;
		};
		list: {
			readonly id: string;
			readonly __typename: string | null;
			readonly name: string;
			readonly teamEnvironment: {
				readonly environment: {
					readonly name: string;
				};
			};
			readonly team: {
				readonly slug: string;
			};
			readonly workload?: {
				readonly __typename: string | null;
				readonly name: string;
				readonly teamEnvironment: {
					readonly environment: {
						readonly name: string;
					};
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
	} = $props();
</script>

{#if pageInfo.totalCount}
	<div class="content-wrapper">
		<div>
			{@render description()}

			{#if create}
				<div class="button">
					<Button variant="secondary" size="small" as="a" href={create.url} icon={PlusIcon}>
						{create.buttonText}
					</Button>
				</div>
			{/if}
			<List title="{pageInfo.totalCount} entries">
				{#snippet menu()}
					<OrderByMenu {orderField} {defaultOrderField} />
				{/snippet}
				{#each list as instance (instance.id)}
					<ListItem>
						<div>
							<PersistenceLink {instance} />
							<Tag size="small" variant={envTagVariant(instance.teamEnvironment.environment.name)}
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
				page={pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeParams({ after: '', before: pageInfo.startCursor ?? '' }, { noScroll: true }),
					loadNextPage: () =>
						changeParams({ before: '', after: pageInfo.endCursor ?? '' }, { noScroll: true })
				}}
			/>
		</div>
		<div class="right-column">
			{#if cost}
				<div>
					<PersistenceCost
						{...cost}
						from={startOfMonth(subMonths(new Date(), 1))}
						to={endOfYesterday()}
					/>
				</div>
			{/if}
			{#if cdnBucket && viewerIsMember}
				<div>
					<CdnBucket {cdnBucket} />
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="content-wrapper">
		{@render notFound()}
		<div class="right-column">
			{#if cdnBucket && viewerIsMember}
				<div>
					<CdnBucket {cdnBucket} />
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
	.button {
		display: flex;
		justify-content: flex-end;
		margin-bottom: var(--spacing-layout);
	}
</style>
