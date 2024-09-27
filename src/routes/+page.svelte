<script lang="ts">
	import Card from '$lib/Card.svelte';
	//import Feedback from '$lib/components/Feedback.svelte';
	import {
		Button,
		LinkPanel,
		LinkPanelDescription,
		LinkPanelTitle
	} from '@nais/ds-svelte-community';
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		PersonGroupIcon,
		PlusIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	//let feedbackOpen = false;

	export let data: PageData;

	$: ({ UserTeams } = data);
</script>

<svelte:head><title>Console</title></svelte:head>

<div class="page">
	<div class="feedback">
		<Button
			variant="secondary"
			size="xsmall"
			on:click={() => {
				/*feedbackOpen = true;*/
				console.log('Feedback');
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
				<Button as="a" size="small" href="/team/create" variant="primary"
					><svelte:fragment slot="icon-left"><PlusIcon /></svelte:fragment>Create team</Button
				>
			</div>
			<div class="teams">
				{#if $UserTeams.data}
					{#if $UserTeams.data.me.__typename == 'User'}
						{#each $UserTeams.data.me.teams.edges as edge}
							<LinkPanel
								about={edge.node.team.purpose}
								href="/team/{edge.node.team.slug}"
								border={true}
								as="a"
							>
								<LinkPanelTitle>{edge.node.team.slug}</LinkPanelTitle>
								<LinkPanelDescription>{edge.node.team.purpose}</LinkPanelDescription>
							</LinkPanel>
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
										on:click={async () => {
											return await UserTeams.loadPreviousPage();
										}}><ChevronLeftIcon /></Button
									>
									<Button
										size="small"
										variant="secondary"
										disabled={!$UserTeams.data.me.teams.pageInfo.hasNextPage}
										on:click={async () => {
											console.log('Next page');
											return await UserTeams.loadNextPage();
										}}
									>
										<ChevronRightIcon /></Button
									>
								</span>
							</div>
						{/if}
					{/if}
				{/if}
			</div>
		</Card>

		<!--Card columns={8} rows={2}>
			<Deploys />
		</Card-->
	</div>
</div>

<!--
{#if feedbackOpen}
	<Feedback bind:open={feedbackOpen} />
{/if}
-->

<style>
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
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
</style>
