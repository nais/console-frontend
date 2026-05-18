<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import { Modal } from '@nais/ds-svelte-community';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';

	let { open = $bindable(false) }: { open: boolean } = $props();

	const userTeams = graphql(`
		query TeamSwitcherTeams @cache(policy: CacheAndNetwork) {
			me {
				__typename
				... on User {
					teams(first: 50) @paginate(mode: SinglePage) {
						nodes {
							team {
								slug
							}
						}
					}
				}
			}
		}
	`);

	$effect(() => {
		if (open) {
			userTeams.fetch();
		}
	});

	const teams = $derived(
		($userTeams.data?.me.__typename === 'User' ? $userTeams.data.me.teams.nodes : []).map(
			(n) => n.team.slug
		)
	);

	const currentTeam = $derived(page.params.team);

	let selected = $state(0);

	$effect(() => {
		if (open) {
			selected = 0;
		}
	});

	function selectTeam(slug: string) {
		open = false;
		if (slug !== currentTeam) {
			goto(`/team/${slug}`);
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selected = Math.min(selected + 1, teams.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selected = Math.max(selected - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const team = teams[selected];
			if (team) selectTeam(team);
		}
	}
</script>

<svelte:document onkeydown={open ? onKeydown : undefined} />

<Modal width="small" bind:open class="team-switcher-modal">
	<div class="team-switcher">
		<div class="team-list" role="listbox">
			{#each teams as team, i (team)}
				<button
					class="team-item"
					class:selected={i === selected}
					class:current={team === currentTeam}
					role="option"
					aria-selected={i === selected}
					onclick={() => selectTeam(team)}
					onmouseenter={() => (selected = i)}
				>
					<span class="team-icon"><PersonGroupIcon /></span>
					<span class="team-name">{team}</span>
					{#if team === currentTeam}
						<span class="current-badge">CURRENT</span>
					{/if}
				</button>
			{/each}
		</div>
		<div class="hints">
			<span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
			<span><kbd>↵</kbd> select</span>
			<span><kbd>esc</kbd> close</span>
		</div>
	</div>
</Modal>

<style>
	.team-switcher {
		display: flex;
		flex-direction: column;
	}

	.team-list {
		padding: var(--ax-space-4);
	}

	.team-item {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		width: 100%;
		padding: var(--ax-space-8) var(--ax-space-12);
		border: none;
		border-radius: var(--ax-radius-8);
		background: transparent;
		color: inherit;
		font-size: var(--ax-font-size-medium);
		cursor: pointer;
		text-align: left;

		&.selected {
			background: color-mix(in srgb, var(--surface-accent-color) 8%, transparent);
		}

		&.current {
			background: color-mix(in srgb, var(--surface-accent-color) 6%, transparent);
		}
	}

	.team-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		flex-shrink: 0;
		border-radius: var(--ax-radius-4);
		font-size: 1rem;
		color: var(--ax-text-neutral-subtle);
		background: color-mix(in srgb, var(--ax-text-neutral-subtle) 10%, transparent);
	}

	.current .team-icon {
		color: var(--surface-accent-color);
		background: color-mix(in srgb, var(--surface-accent-color) 12%, transparent);
	}

	.team-name {
		flex: 1;
		font-weight: var(--ax-font-weight-bold);
	}

	.current-badge {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		color: var(--surface-accent-color);
		text-transform: uppercase;
	}

	.hints {
		display: flex;
		gap: var(--ax-space-16);
		padding: var(--ax-space-8) var(--ax-space-16);
		border-top: 1px solid var(--ax-border-neutral-subtleA);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);

		kbd {
			font-size: var(--ax-font-size-small);
			border: 1px solid var(--ax-border-neutral-subtleA);
			border-radius: var(--ax-radius-4);
			padding: 0 var(--ax-space-4);
			font-family: inherit;
		}
	}
</style>
