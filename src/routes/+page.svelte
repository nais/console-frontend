<script lang="ts">
	import List from '$lib/components/list/List.svelte';
	import TeamListItem from '$lib/components/list/TeamListItem.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { BodyLong, Button } from '@nais/ds-svelte-community';
	import Logo from '../Logo.svelte';
	import type { PageProps } from './$houdini';
	import Onboarding from './Onboarding.svelte';

	let { data }: PageProps = $props();

	let UserTeams = $derived(data.UserTeams);
	let tenantName = $derived(data.tenantName);

	let userTeams = $derived(
		$UserTeams.data?.me.__typename == 'User' && $UserTeams.data?.me.teams?.nodes.length
	);
</script>

<svelte:head><title>Console</title></svelte:head>

{#if userTeams === 0}
	<div class="page">
		<Onboarding {tenantName} />
	</div>
{:else}
	<div class="hero">
		<div class="logo-wrapper">
			<Logo height="min(15vw, 262.5px)" />
		</div>
		<div>
			Know what's running, what it costs, <br />
			and where the risks are.
		</div>
	</div>
	<div class="page">
		<div class="content-wrapper">
			<div class="header">
				<h2>My teams</h2>
				<Button as="a" size="medium" href="/team/create" variant="primary">Create team</Button>
			</div>
			{#if $UserTeams.data}
				{#if $UserTeams.data.me.__typename == 'User'}
					<List>
						{#each $UserTeams.data.me.teams.nodes as node (node.team.id)}
							<TeamListItem
								team={node.team}
								errors={node.team.workloads.nodes.filter((w) =>
									w.status.errors.some((e) => e.__typename === 'WorkloadStatusDeprecatedRegistry')
								).length}
							/>
						{:else}
							<BodyLong>
								You don't seem to belong to any teams at the moment. You can create a new team or
								search for the team you'd like to join. Once you find it, locate one of the owners
								in the members list on the team page to request membership.
							</BodyLong>
						{/each}
					</List>
					<Pagination
						page={$UserTeams.data.me.teams.pageInfo}
						loaders={{
							loadPreviousPage: UserTeams.loadPreviousPage,
							loadNextPage: UserTeams.loadNextPage
						}}
					/>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.page {
		padding-top: 4rem;
	}
	.content-wrapper {
		background: var(--a-surface-default);
		position: relative;
		top: -40px;
		padding: var(--a-spacing-6);
		border-radius: 12px;
		max-width: 900px;
		margin-inline: auto;
	}
	.hero {
		padding: 2rem;
		background-color: var(--brand-color);
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		justify-content: center;
		gap: min(2vw, 35px);
		overflow: hidden;
		font-size: max(min(2.4vw, 42px), 30px);
		font-weight: 600;
		letter-spacing: -0.4px;
	}
	.logo-wrapper {
		background-color: var(--a-surface-inverted);
		border-radius: 100%;
		height: min(40vw, 700px);
		width: min(40vw, 700px);
		margin-block: max(-10vw, -175px);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--a-spacing-4);
	}
</style>
