<script lang="ts">
	import Globe from '$lib/icons/Globe.svelte';
	import { fragment, graphql, PendingValue } from '$houdini';
	import type { AccessPolicy } from '$houdini';
	import { page } from '$app/stores';
	import Loading from '$lib/Loading.svelte';

	export let app: AccessPolicy;

	$: data = fragment(
		app,
		graphql(`
			fragment AccessPolicy on App @loading {
				name
				ingresses
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

	let hasExternal = false;
	let hasInternal = false;
	const externalName = (v: string) => {
		hasExternal = true;
		return v;
	};
	const internalName = (v: string) => {
		hasInternal = true;
		return v;
	};
</script>

<div class="traffic">
	<div class="directionContent first">
		<h5>Inbound</h5>
		<h6>External ingresses</h6>
		<ul>
			{#each $data.ingresses as ingress}
				{#if ingress === PendingValue}
					<Loading width="300px" />
				{:else if ingress.includes('.external.')}
					<li>
						<Globe /><a href={ingress}>{externalName(ingress)}</a>
					</li>
				{/if}
			{/each}
			{#if !hasExternal}
				<li>No external ingresses</li>
			{/if}
		</ul>
		<h6>Internal ingresses</h6>
		<ul>
			{#each $data.ingresses as ingress}
				{#if ingress === PendingValue}
					<Loading width="300px" />
				{:else if !ingress.includes('.external.')}
					<li><a href={ingress}>{internalName(ingress)}</a></li>
				{/if}
			{/each}
			{#if !hasInternal}
				<li>No internal ingresses</li>
			{/if}
		</ul>
		<h6>Applications</h6>
		<ul>
			{#each $data.accessPolicy.inbound.rules as rule}
				<li>
					{#if rule.application !== PendingValue}
						<a href="/team/{rule.namespace || team}/{env}/app/{rule.application}"
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
		<h5>Outbound</h5>
		<h6>External hostnames</h6>
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
		<h6>Applications</h6>
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
