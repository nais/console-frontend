<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { Box, Button } from '@nais/ds-svelte-community';
	import { PersonGroupIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import Deploys from './Deploys.svelte';
	import Onboarding from './Onboarding.svelte';

	let feedbackOpen = $state(false);

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let UserTeams = $derived(data.UserTeams);
	let tenantName = $derived(data.tenantName);

	let userTeams = $derived(
		$UserTeams.data?.me.__typename == 'User' && $UserTeams.data?.me.teams?.nodes.length
	);
</script>

<svelte:head><title>Console</title></svelte:head>

<div class="page">
	<div class="feedback">
		<Button
			variant="secondary"
			size="xsmall"
			onclick={() => {
				feedbackOpen = true;
			}}>Feedback</Button
		>
	</div>
	<div class="grid">
		{#if userTeams !== false && userTeams === 0}
			<Onboarding {tenantName} />
		{:else}
			<Card columns={4} rows={1}>
				<div class="header">
					<h2>
						<PersonGroupIcon />
						My teams
					</h2>
					<Button as="a" size="small" href="/team/create" variant="primary" icon={PlusIcon}>
						Create teamsasf
					</Button>
				</div>
				{#if $UserTeams.data}
					{#if $UserTeams.data.me.__typename == 'User'}
						<div class="teams">
							{#each $UserTeams.data.me.teams.nodes as node}
								<Box
									as="a"
									background="surface-default"
									borderColor="border-default"
									padding="4"
									borderWidth="1"
									borderRadius="medium"
									href={`/team/${node.team.slug}`}
									class="box"
								>
									<h3>{node.team.slug}</h3>
									<span>{node.team.purpose}</span>
								</Box>
							{:else}
								<p>
									You don't seem to belong to any teams at the moment. You can create a new team or
									search for the team you'd like to join. Once you find it, locate one of the owners
									in the members list on the team page to request membership.
								</p>
							{/each}
						</div>
						<Pagination
							page={$UserTeams.data.me.teams.pageInfo}
							loaders={{
								loadPreviousPage: () => UserTeams.loadPreviousPage(),
								loadNextPage: () => UserTeams.loadNextPage()
							}}
						/>
					{/if}
				{/if}
			</Card>

			<Card columns={8} rows={1}>
				<Deploys />
			</Card>
		{/if}
	</div>
</div>

{#if feedbackOpen}
	<Feedback bind:open={feedbackOpen} />
{/if}

<style>
	h3 {
		font-weight: 600;
		margin-bottom: 0;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.feedback {
		display: flex;
		justify-content: flex-end;
		padding: 0.5rem 0;
	}

	h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.teams {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		:global(.box) {
			text-decoration: none;
			color: var(--a-text-default);
			display: block;
			> * {
				text-decoration: none;
				color: var(--a-text-default);
			}
			&:hover {
				h3 {
					text-decoration: underline;
					color: var(--a-text-action-hover);
				}
				box-shadow: var(--a-shadow-large);
				border-color: var(--ac-link-panel-hover-border, var(--a-border-action));
			}
			&:active,
			&:focus {
				background-color: var(--a-surface-subtle);
			}
		}
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
</style>
