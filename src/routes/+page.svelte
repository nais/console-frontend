<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import { Box, Button } from '@nais/ds-svelte-community';
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		PersonGroupIcon,
		PlusIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import Deploys from './Deploys.svelte';

	let feedbackOpen = $state(false);

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let UserTeams = $derived(data.UserTeams);
</script>

<svelte:head><title>Console</title></svelte:head>

<div class="page">
	<div class="feedback">
		<Button
			variant="secondary"
			size="xsmall"
			onClick={() => {
				feedbackOpen = true;
			}}>Feedback</Button
		>
	</div>
	<div class="grid">
		<Card columns={4} rows={1}>
			<div class="header">
				<h2>
					<PersonGroupIcon />
					My teams
				</h2>
				<Button as="a" size="small" href="/team/create" variant="primary" iconLeft={PlusIcon}>
					Create team
				</Button>
			</div>
			<div class="teams">
				{#if $UserTeams.data}
					{#if $UserTeams.data.me.__typename == 'User'}
						{#each $UserTeams.data.me.teams.nodes as node}
							<!--div class="box">
								<h3>{node.team.slug}</h3>
								<span>{node.team.purpose}</span>
							</div-->
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
							<p>You are not a member of any teams.</p>
						{/each}
						{#if $UserTeams.data.me.teams.pageInfo.hasPreviousPage || $UserTeams.data.me.teams.pageInfo.hasNextPage}
							<div class="pagination">
								<span>
									{#if $UserTeams.data.me.teams.pageInfo.pageStart !== $UserTeams.data.me.teams.pageInfo.pageEnd}
										{$UserTeams.data.me.teams.pageInfo.pageStart} - {$UserTeams.data.me.teams
											.pageInfo.pageEnd}
									{:else}
										{$UserTeams.data.me.teams.pageInfo.pageStart}
									{/if}

									of {$UserTeams.data.me.teams.pageInfo.totalCount}
								</span>

								<span style="padding-left: 1rem;">
									<Button
										size="small"
										variant="secondary"
										disabled={!$UserTeams.data.me.teams.pageInfo.hasPreviousPage}
										onClick={async () => {
											return await UserTeams.loadPreviousPage();
										}}
									>
										<ChevronLeftIcon />
									</Button>
									<Button
										size="small"
										variant="secondary"
										disabled={!$UserTeams.data.me.teams.pageInfo.hasNextPage}
										onClick={async () => {
											return await UserTeams.loadNextPage();
										}}
									>
										<ChevronRightIcon />
									</Button>
								</span>
							</div>
						{/if}
					{/if}
				{/if}
			</div>
		</Card>

		<Card columns={8} rows={1}>
			<Deploys />
		</Card>
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
	.pagination {
		text-align: right;
		padding: 0.5rem;
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
					color: var(--a-text-action-hover)
				}
				box-shadow: var(--a-shadow-large);
				border-color: var(--ac-link-panel-hover-border, var(--a-border-action));
			}
			&:active, &:focus{
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
