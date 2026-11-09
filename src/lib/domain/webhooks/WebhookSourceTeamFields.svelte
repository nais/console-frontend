<script lang="ts">
	import { MagnifyingGlassIcon, PlusIcon } from '#lib/icons/index.js';
	import {
		BodyShort,
		Button,
		Checkbox,
		Modal,
		Radio,
		RadioGroup,
		TextField
	} from '#lib/shadcn/ui/index.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import { graphql } from '$houdini';
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	let {
		ownerTeamSlug,
		initialSelected,
		initialScope = initialSelected.length === 0
			? 'all'
			: initialSelected.length === 1 && initialSelected[0] === ownerTeamSlug
				? 'team'
				: 'selected',
		disabled = false
	}: {
		ownerTeamSlug: string;
		initialSelected: readonly string[];
		initialScope?: 'team' | 'all' | 'selected';
		disabled?: boolean;
	} = $props();

	const uid = $props.id();
	const selected = new SvelteSet(untrack(() => initialSelected));
	let scope = $state(untrack(() => initialScope));
	let query = $state('');
	let searchedQuery = $state('');
	let searchOpen = $state(false);

	const teamSearch = graphql(`
		query WebhookSourceTeamSearch(
			$query: String!
			$after: Cursor
			$before: Cursor
			$first: Int
			$last: Int
		) {
			search(
				first: $first
				last: $last
				after: $after
				before: $before
				filter: { query: $query, types: [TEAM] }
			) @paginate(mode: SinglePage) {
				nodes {
					__typename
					... on Team {
						slug
					}
				}
				pageInfo {
					hasNextPage
					hasPreviousPage
					pageStart
					pageEnd
					totalCount
					startCursor
					endCursor
				}
			}
		}
	`);

	const results = $derived(
		$teamSearch.data?.search.nodes.filter((node) => node.__typename === 'Team') ?? []
	);
	const page = $derived($teamSearch.data?.search.pageInfo);

	async function searchTeams(search: string, after?: string, before?: string) {
		searchedQuery = search;
		await teamSearch.fetch({
			variables: {
				query: searchedQuery,
				after: after ?? null,
				before: before ?? null,
				first: before ? null : 25,
				last: before ? 25 : null
			}
		});
	}
</script>

<div class="source-fields">
	<RadioGroup
		name="sourceScope"
		legend="Event sources"
		description="Choose which teams' events to receive."
		bind:value={scope}
		{disabled}
	>
		<Radio value="team" {disabled}>This team</Radio>
		<Radio value="all" {disabled}>All teams</Radio>
		<Radio value="selected" {disabled}>Selected teams</Radio>
	</RadioGroup>

	{#if scope === 'team'}
		<BodyShort size="small">Receive events only from {ownerTeamSlug}.</BodyShort>
	{:else if scope === 'all'}
		<BodyShort size="small">Receive events from all teams, excluding global events.</BodyShort>
	{:else}
		<div role="group" aria-labelledby={`${uid}-selected`} class="team-options">
			<BodyShort id={`${uid}-selected`} size="small">Selected source teams</BodyShort>
			{#each [...selected] as slug (slug)}
				<Checkbox
					name="sourceTeamSlugs"
					value={slug}
					checked
					size="small"
					{disabled}
					onchange={() => selected.delete(slug)}
				>
					{slug}
				</Checkbox>
			{:else}
				<BodyShort size="small">Select at least one source team.</BodyShort>
			{/each}
		</div>

		<div>
			<Button
				type="button"
				variant="secondary"
				size="small"
				icon={PlusIcon}
				aria-haspopup="dialog"
				aria-expanded={searchOpen}
				aria-controls={`${uid}-team-search`}
				{disabled}
				onclick={() => (searchOpen = true)}
			>
				Add teams
			</Button>
		</div>

		<Modal id={`${uid}-team-search`} bind:open={searchOpen} header="Add source teams" width="small">
			<div class="team-picker">
				<div class="team-search">
					<TextField
						label="Find source teams"
						placeholder="Search by team name"
						bind:value={query}
						disabled={disabled || $teamSearch.fetching}
						onkeydown={(event) => {
							if (event.key === 'Enter') {
								event.preventDefault();
								if (query.trim() && !$teamSearch.fetching) searchTeams(query.trim());
							}
						}}
					/>
					<Button
						type="button"
						variant="secondary"
						icon={MagnifyingGlassIcon}
						loading={$teamSearch.fetching}
						disabled={disabled || !query.trim()}
						onclick={() => searchTeams(query.trim())}
					>
						Search teams
					</Button>
				</div>

				<GraphErrors errors={$teamSearch.errors} />
				{#if searchedQuery && !$teamSearch.fetching && !$teamSearch.errors?.length && page}
					<ul aria-label="Source team search results" class="team-options search-results">
						{#each results as team (team.slug)}
							<li class="team-result">
								<BodyShort size="small">{team.slug}</BodyShort>
								<Button
									type="button"
									variant="secondary"
									size="small"
									icon={PlusIcon}
									aria-label={`${selected.has(team.slug) ? 'Added' : 'Add'} ${team.slug}`}
									disabled={disabled || selected.has(team.slug)}
									onclick={() => selected.add(team.slug)}
								>
									{selected.has(team.slug) ? 'Added' : 'Add'}
								</Button>
							</li>
						{:else}
							<li><BodyShort size="small">No matching teams found.</BodyShort></li>
						{/each}
					</ul>
					<Pagination
						{page}
						fetching={$teamSearch.fetching}
						loaders={{
							loadPreviousPage: () =>
								searchTeams(searchedQuery, undefined, page.startCursor ?? undefined),
							loadNextPage: () => searchTeams(searchedQuery, page.endCursor ?? undefined)
						}}
					/>
				{/if}
			</div>
			{#snippet footer()}
				<Button type="button" onclick={() => (searchOpen = false)}>Done</Button>
			{/snippet}
		</Modal>
	{/if}
</div>

<style>
	.source-fields,
	.team-options,
	.team-picker {
		display: grid;
		gap: var(--ax-space-12);
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.team-search {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--ax-space-12);
	}

	.search-results {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.team-result {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-12);
	}
</style>
