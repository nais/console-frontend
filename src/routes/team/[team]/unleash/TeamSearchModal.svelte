<script lang="ts">
	import Search from '$lib/domain/search/Search.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { Modal } from '@nais/ds-svelte-community';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import { queryStore } from '@urql/svelte';
	import { AllTeamsQuery, TeamSearchQuery } from './unleash';

	let {
		open = $bindable(),
		addTeam,
		removeTeam,
		currentTeam,
		teamsWithAccess
	}: {
		open: boolean;
		addTeam: (teamname: string) => Promise<unknown>;
		removeTeam: (teamname: string) => Promise<unknown>;
		currentTeam: string;
		teamsWithAccess: string[];
	} = $props();

	const client = getContextClient();

	let query = $state('');
	let debouncedQuery = $state('');

	const allTeams = queryStore({
		client,
		query: AllTeamsQuery,
		variables: {}
	});

	const teamSearch = $derived(
		queryStore({
			client,
			query: TeamSearchQuery,
			variables: { query: debouncedQuery },
			pause: !debouncedQuery
		})
	);

	$effect(() => {
		if (!query) {
			debouncedQuery = '';
			return;
		}
		const timeout = setTimeout(() => {
			debouncedQuery = query;
		}, 300);
		return () => clearTimeout(timeout);
	});

	const loading = $derived(query ? ($teamSearch.fetching ?? true) : ($allTeams.fetching ?? true));

	type TeamResult = { slug: string; purpose: string };

	const results: TeamResult[] = $derived.by(() => {
		if (query) {
			const edges = $teamSearch.data?.search.edges ?? [];
			const out: TeamResult[] = [];
			for (const edge of edges) {
				const n = edge.node;
				if (n.__typename === 'Team') {
					out.push({ slug: n.slug, purpose: n.purpose });
				}
			}
			return out;
		}
		return ($allTeams.data?.teams.nodes ?? []).map((n) => ({ slug: n.slug, purpose: n.purpose }));
	});
</script>

<Modal width="small" bind:open class="search-modal">
	<Search
		close={() => (open = false)}
		placeholder="Search for teams to add"
		bind:query
		{loading}
		suggestions={false}
		results={results
			.filter((r) => r.slug !== currentTeam)
			.map(
				(result) =>
					({
						icon: PersonGroupIcon,
						label: result.slug,
						description: result.purpose,
						type: 'button',
						button: teamsWithAccess.includes(result.slug)
							? ({
									onclick: () => removeTeam(result.slug),
									label: 'Remove',
									variant: 'danger'
								} as const)
							: ({
									onclick: () => addTeam(result.slug),
									label: 'Add',
									variant: 'primary'
								} as const)
					}) as const
			)}
	/>
</Modal>
