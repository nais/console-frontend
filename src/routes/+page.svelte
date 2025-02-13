<script lang="ts">
	import Feedback from '$lib/feedback/Feedback.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { Box, Button, Heading } from '@nais/ds-svelte-community';
	import { PersonGroupIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import Logo from '../Logo.svelte';
	import type { PageData } from './$houdini';
	import Onboarding from './Onboarding.svelte';
	import IconWithText from '$lib/components/IconWithText.svelte';

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

{#if userTeams !== false && userTeams === 0}
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
			<Onboarding {tenantName} />
		</div>
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
					<div class="teams">
						{#each $UserTeams.data.me.teams.nodes as node}
							<Box
								as="a"
								background="surface-subtle"
								padding="4"
								borderRadius="medium"
								href={`/team/${node.team.slug}`}
								class="box"
							>
								<IconWithText size="large" icon={PersonGroupIcon} description={node.team.purpose}>
									{#snippet text()}
										<h3>{node.team.slug}</h3>
									{/snippet}
								</IconWithText>
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
							loadPreviousPage: UserTeams.loadPreviousPage,
							loadNextPage: UserTeams.loadNextPage
						}}
					/>
				{/if}
			{/if}
		</div>
	</div>
{/if}

{#if feedbackOpen}
	<Feedback bind:open={feedbackOpen} />
{/if}

<style>
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
		border-radius: 12px;
		overflow: hidden;
		gap: 2px;

		:global(.box) {
			border-radius: 0;
			text-decoration: none;
			color: var(--a-text-default);
			display: grid;
			grid-template-columns: auto 1fr;
			gap: 12px;

			> * {
				text-decoration: none;
				color: var(--a-text-default);
			}
			&:hover {
				h3 {
					text-decoration: underline;
					color: var(--a-text-action-hover);
				}
				background-color: var(--a-gray-200);
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
