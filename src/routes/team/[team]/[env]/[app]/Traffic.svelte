<script lang="ts">
	import { page } from '$app/stores';
	import Arrow from '$lib/icons/Arrow.svelte';
	import Globe from '$lib/icons/Globe.svelte';
	import { fragment, graphql, type AccessPolicy, type AppInstances } from '$houdini';
	import type { AppInstancesStatus } from '$houdini';

	export let app: AccessPolicy;

	$: data = fragment(
		app,
		graphql(`
			fragment AccessPolicy on App {
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
							application
							namespace
						}
						external {
							host
							ports {
								port
							}
						}
					}
				}
			}
		`)
	);
</script>

<div class="traffic">
	<div class="directionContent">
		<h5>Internal ingresses:</h5>
		<ul>
			{#each $data.ingresses as ingress}
				{#if !ingress.includes('external')}
					<li><Globe /><a href={ingress}>{ingress}</a></li>
				{/if}
			{/each}
		</ul>
		<h5>External ingresses:</h5>
		<ul>
			{#each $data.ingresses as ingress}
				<li>
					{#if ingress.includes('external')}
						<Globe /><a href={ingress}>{ingress}</a>
					{/if}
				</li>
			{/each}
		</ul>
		<h5>Inbound access policy:</h5>
		<ul>
			{#each $data.accessPolicy.inbound.rules as rule}
				<li>
					<a href="/"
						>{rule.application}{#if rule.namespace}.{rule.namespace}{/if}</a
					>
				</li>
			{/each}
		</ul>
	</div>
	<div class="arrow">
		<Arrow size="2rem" />
	</div>
	<div class="applicationName">
		<h1>{$data.name}</h1>
	</div>
	<div class="arrow">
		<Arrow size="2rem" />
	</div>
	<div class="directionContent">
		<h5>Outbound access policy:</h5>
		<ul>
			{#each $data.accessPolicy.outbound.rules as rule}
				<li>
					<a href="/"
						>{rule.application}{#if rule.namespace}.{rule.namespace}{/if}</a
					>
				</li>
			{/each}
		</ul>
		<h5>Outbound external access policy:</h5>
		<ul>
			{#each $data.accessPolicy.outbound.external as external}
				{#each external.ports as port}
					<li>
						<Globe /><a href="{external.host}:{port.port}">{external.host}:{port.port}</a><br />
					</li>
				{:else}
					<li><Globe /><a href={external.host}>{external.host}</a><br /></li>
				{/each}
			{/each}
		</ul>
	</div>
</div>

<style>
	.traffic {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.directionContent {
		display: flex;
		flex-direction: column;
	}
	.applicationName {
		display: flex;
		align-items: center;
		gap: 3rem;
	}
	.arrow {
		width: 2rem;
		height: 2rem;
		transform: rotate(180deg);
		color: var(--a-icon-default);
	}
	.directionContent,
	h5 {
		margin: 0;
	}
	.directionContent,
	ul {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem 0;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-direction: row;
	}
</style>
