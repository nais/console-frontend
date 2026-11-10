<script lang="ts">
	import { tick } from 'svelte';
	import PageHeader from './PageHeader.svelte';

	let loaded = $state(25);
	let fetching = $state(false);
	let error = $state<{ message: string }[] | undefined>();
	let { fail = false }: { fail?: boolean } = $props();
	const user = $derived({
		name: 'Test User',
		isAdmin: false,
		teams: {
			nodes: Array.from({ length: loaded }, (_, index) => ({
				team: {
					id: `test-team-${index + 1}`,
					slug: `test-team-${String(index + 1).padStart(2, '0')}`,
					purpose: ''
				}
			})),
			pageInfo: { hasNextPage: loaded < 30 }
		}
	});

	async function loadMoreTeams() {
		fetching = true;
		error = undefined;
		await tick();
		if (fail) error = [{ message: 'Could not load additional teams' }];
		else loaded = 30;
		fetching = false;
	}
</script>

<PageHeader {user} {loadMoreTeams} teamsFetching={fetching} teamErrors={error} />
