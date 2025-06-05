<script lang="ts">
	import { supportedErrorTypes } from '$lib/components/errors/ErrorMessage.svelte';
	import { badgeLevel } from '$lib/components/list/Badge.svelte';
	import List from '$lib/components/list/List.svelte';
	import TeamListItem from '$lib/components/list/TeamListItem.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { BodyLong, Button, Heading } from '@nais/ds-svelte-community';
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

<svelte:head><title>Nais Console</title></svelte:head>

{#if userTeams === 0}
	<div class="page">
		<Onboarding {tenantName} />
	</div>
{:else}
	<div class="hero dark">
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
				<Heading level="1" size="large">My Teams</Heading>
				<Button as="a" size="medium" href="/team/create" variant="primary">Create team</Button>
			</div>
			{#if $UserTeams.data}
				{#if $UserTeams.data.me.__typename == 'User'}
					<List>
						{#each $UserTeams.data.me.teams.nodes as node (node.team.id)}
							{@const errors = node.team.workloads.nodes.flatMap((w) =>
								w.status.errors.filter((e) =>
									supportedErrorTypes.some((errorType) => errorType === e.__typename)
								)
							)}
							<TeamListItem
								team={node.team}
								badge={{
									count: errors.length,
									level: badgeLevel(errors)
								}}
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
		background: var(--ax-bg-default);
		position: relative;
		top: -40px;
		padding: var(--ax-space-24);
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
		color: var(--ax-text-neutral-contrast,);
	}
	.logo-wrapper {
		background-color: var(--ax-bg-default);
		border-radius: 100%;
		height: min(40vw, 700px);
		width: min(40vw, 700px);
		margin-block: max(-10vw, -175px);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--ax-space-16);
	}
</style>
