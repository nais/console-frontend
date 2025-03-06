<script lang="ts">
	import { UserOrderField } from '$houdini';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyShort, Heading } from '@nais/ds-svelte-community';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { People } = $derived(data);

	let after: string = $state($People.variables?.after ?? '');
	let before: string = $state($People.variables?.before ?? '');

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after
		});
	};
</script>

<div class="container">
	<Heading level="1" size="large" spacing>Nais Console Users</Heading>
	<List
		title="{$People.data?.users.pageInfo.totalCount} user{$People.data?.users.pageInfo
			.totalCount !== 1
			? 's'
			: ''}"
	>
		{#snippet menu()}
			<OrderByMenu orderField={UserOrderField} defaultOrderField={UserOrderField.NAME} />
		{/snippet}
		{#if $People.data?.users.edges}
			{#each $People.data?.users.edges as edge (edge.node.id)}
				<ListItem>
					<div class="item">
						<div>
							<BodyShort size="small">
								{edge.node.name}
							</BodyShort>
							<BodyShort size="small">
								<span style="color: var(--a-text-subtle);">{edge.node.email}</span>
							</BodyShort>
						</div>
						<div>
							{#each edge.node.teams.nodes as team (team.team.id + team.role)}
								<IconLabel
									label={team.team.slug}
									icon={PersonGroupIcon}
									description={team.role}
									size="small"
									href="/team/{team.team.slug}"
								/>
							{/each}
						</div>
					</div>
				</ListItem>
			{/each}
		{/if}
	</List>
	<Pagination
		page={$People.data?.users.pageInfo}
		loaders={{
			loadPreviousPage: () => {
				changeQuery({ before: $People.data?.users.pageInfo.startCursor ?? '' });
			},
			loadNextPage: () => {
				changeQuery({ after: $People.data?.users.pageInfo.endCursor ?? '' });
			}
		}}
	/>
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);

		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.item {
		display: grid;
		grid-template-columns: 70lvi 1fr;
	}
</style>
