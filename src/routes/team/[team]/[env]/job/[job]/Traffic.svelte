<script lang="ts">
	import { page } from '$app/stores';
	import type { JobAccessPolicy } from '$houdini';
	import { fragment, graphql, PendingValue } from '$houdini';
	import Globe from '$lib/icons/Globe.svelte';
	import Loading from '$lib/Loading.svelte';

	export let job: JobAccessPolicy;

	$: data = fragment(
		job,
		graphql(`
			fragment JobAccessPolicy on NaisJob @loading {
				name
				accessPolicy {
					inbound {
						rules {
							application
							namespace
						}
					}
					outbound {
						rules {
							application @loading
							namespace
						}
						external {
							host @loading
							ports {
								port
							}
						}
					}
				}
			}
		`)
	);
	$: env = $page.params.env;
	$: team = $page.params.team;
</script>

<div class="traffic">
	<div class="directionContent first">
		<h4>Inbound</h4>
		<h5>Applications</h5>
		<ul>
			{#each $data.accessPolicy.inbound.rules as rule}
				<li>
					{#if rule.application !== PendingValue}
						<a href="/team/{rule.namespace || team}/{env}/{rule.application}"
							>{rule.application}{#if rule.namespace}.{rule.namespace}{/if}</a
						>
					{:else}
						<Loading width="300px" />
					{/if}
				</li>
			{:else}
				<li>No inbound access policy</li>
			{/each}
		</ul>
	</div>
	<div class="directionContent">
		<h4>Outbound</h4>
		<h5>External hostnames</h5>
		<ul>
			{#each $data.accessPolicy.outbound.external as external}
				{#if external.host === PendingValue}
					<Loading width="300px" />
				{:else}
					{#each external.ports as port}
						<li>
							<Globe /><a href="{external.host}:{port.port}">{external.host}:{port.port}</a><br />
						</li>
					{:else}
						<li><Globe /><a href={external.host}>{external.host}</a><br /></li>
					{/each}
				{/if}
			{:else}
				<li>No outbound external access policy</li>
			{/each}
		</ul>
		<h5>Applications</h5>
		<ul>
			{#each $data.accessPolicy.outbound.rules as rule}
				<li>
					{#if rule.application === PendingValue}
						<Loading width="300px" />
					{:else}
						<a href="/team/{rule.namespace || team}/{env}/app/{rule.application}"
							>{rule.application}{#if rule.namespace}.{rule.namespace}{/if}</a
						>
					{/if}
				</li>
			{:else}
				<li>No outbound access policy</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.traffic {
		margin-top: 1rem;
		display: flex;
		gap: 2rem;
	}
	.directionContent {
		padding: 1rem;
	}
	.directionContent.first {
		border-right: 1px solid var(--a-border-divider);
		width: 40%;
	}
	.directionContent,
	h5 {
		margin: 0;
	}

	h4 {
		font-weight: 400;
		margin-bottom: 0.5rem;
	}
	.directionContent,
	ul {
		list-style: none;
		margin: 0 0 1rem 0;
		padding: 0 1rem 0 1rem;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-direction: row;
	}
</style>
