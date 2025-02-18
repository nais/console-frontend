<script lang="ts">
	import { graphql } from '$houdini';
	import Search from '$lib/components/search/Search.svelte';
	import { Modal } from '@nais/ds-svelte-community';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';

	const teamSearch = graphql(`
		query TeamSearch($query: String!) {
			search(first: 25, filter: { query: $query, type: TEAM }) {
				edges {
					node {
						__typename
						... on Team {
							slug
							purpose
						}
					}
				}
			}
		}
	`);

	const teamsQuery = graphql(`
		query AllTeams {
			teams(first: 25) {
				nodes {
					slug
					purpose
				}
			}
		}
	`);

	let {
		open = $bindable(),
		addTeam,
		removeTeam,
		currentTeam,
		teamsWithAccess
	}: {
		open: boolean;
		addTeam: (teamname: string) => Promise<any>;
		removeTeam: (teamname: string) => Promise<any>;
		currentTeam: string;
		teamsWithAccess: string[];
	} = $props();

	let query = $state('');
	let loading = $state(true);

	teamsQuery.fetch().then(() => (loading = false));

	$effect(() => {
		if (query) {
			loading = true;

			const timeout = setTimeout(() => {
				teamSearch.fetch({ variables: { query: query } }).then(() => (loading = false));
			}, 300);

			return () => clearTimeout(timeout);
		}
	});
</script>

<Modal width="medium" bind:open class="search-modal">
	<Search
		close={() => (open = false)}
		placeholder="Search for teams to add"
		bind:query
		{loading}
		suggestions={false}
		results={(query
			? $teamSearch.data?.search.edges.map((e) => e.node).filter((n) => n.__typename === 'Team')
			: $teamsQuery.data?.teams.nodes
		)
			?.filter((r) => r.slug !== currentTeam)
			.map(
				(result) =>
					({
						icon: PersonGroupIcon,
						title: result.slug,
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

<style>
	:global(.search-modal) {
		height: 90%;
		max-height: 52rem;

		> :global(.navds-modal__header) {
			display: none;
		}

		> :global(.navds-modal__body) {
			padding: var(--a-spacing-6);
		}
	}
</style>
