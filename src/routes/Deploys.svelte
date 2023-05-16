<script lang="ts">
	import { graphql, paginatedFragment, type UserDeploys } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import Data from '$lib/icons/Data.svelte';
	import DeploysIcon from '$lib/icons/DeploysIcon.svelte';
	export let user: UserDeploys;
	$: teams = paginatedFragment(
		user,
		graphql(`
			fragment UserDeploys on User {
				teams @paginate(mode: SinglePage) {
					totalCount
					edges {
						node {
							deployments {
								totalCount
								edges {
									node {
										created
										env
										team {
											name
										}
										resources {
											kind
											name
										}
										statuses {
											status
										}
									}
								}
							}
						}
					}
				}
			}
		`)
	);
	$: teamDeploys = $teams.data?.teams.edges
		.map((team) => team.node.deployments)
		.flatMap((deploys) => deploys.edges.map((deploy) => deploy.node))
		.sort((a, b) => b.created.getTime() - a.created.getTime())
		.slice(0, 5);
	$: totalDeploys = $teams.data?.teams.edges
		.map((edge) => edge.node.deployments.totalCount)
		.reduce((a, b) => a + b, 0);
</script>

<Card width="250px" height="400px">
	<div class="deployheading">
		<div class="icon">
			<DeploysIcon size="1.5rem" />
		</div>
		<h3>My latest deploys</h3>
	</div>
	{#each teamDeploys || [] as deploy}
		<div class="dep">
			<a href="/team/{deploy.team.name}">{deploy.team.name}</a>
			&nbsp;
			<DeploysIcon />
			&nbsp;
			<a href="/team/{deploy.team.name}/{deploy.env}/{deploy.resources[0].name}">
				{deploy.resources[0].name}</a
			>&nbsp; to {deploy.env}&nbsp;
			<Time time={deploy.created} distance={true} />
		</div>
	{:else}
		<p>no deploys</p>
	{/each}
	<div class="tot">
		{totalDeploys} deploys total
	</div>
</Card>

<style>
	.icon {
		margin-top: 0.2rem;
	}
	.deployheading {
		display: flex;
		vertical-align: top;
		gap: 0.5rem;
	}
	.tot {
		text-align: right;
	}
	.dep {
		padding: 0.5rem;
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		border: 1px solid var(--a-border-default);
		border-radius: 0.25rem;
	}
</style>
