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
		{#each $data.ingresses as ingress}
			<div style="display: flex; align-items: center; flex-direction: row; gap: 0.5rem;">
			{#if !ingress.includes('external')}
				<Globe /><a href="{ingress}">{ingress}</a>
			{/if}
			</div>
		{/each}
		<h5>External ingresses:</h5>
		{#each $data.ingresses as ingress}
			<div style="display: flex; align-items: center; flex-direction: row; gap: 0.5rem;">
			{#if ingress.includes('external')}
				<Globe /><a href="{ingress}">{ingress}</a>
			{/if}
		</div>
		{/each}
		<h5>Inbound access policy:</h5>
		{#each $data.accessPolicy.inbound.rules as rule}
			<div style="display: flex; align-items: center; flex-direction: row; gap: 0.5rem;">
				<a href="/">{rule.application}{#if rule.namespace}.{rule.namespace}{/if}</a><br/>
			</div>
		{/each}
	</div>
	<div class="arrow">
		<Arrow size="2rem" />
	</div>
	<div class="applicationName">
		{$data.name}
	</div>
	<div class="arrow">
		<Arrow size="2rem" />
	</div>
	<div class="directionContent">
		<h5>Outbound access policy:</h5>
			{#each $data.accessPolicy.outbound.rules as rule}
			<div style="display: flex; align-items: center; flex-direction: row; gap: 0.5rem;">
				<a href="/">{rule.application}{#if rule.namespace}.{rule.namespace}{/if}</a><br />
			</div>
			{/each}
		<h5>Outbound external access policy:</h5>
			{#each $data.accessPolicy.outbound.external as external}
			<div>
				{#each external.ports as port}
					<Globe /><a href="{external.host}:{port.port}">{external.host}:{port.port}</a><br />
				{:else}
					<Globe /><a href="{external.host}">{external.host}</a><br />
				{/each}
			</div>
			{/each}
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
	p {
		margin-top: 0;
	}
</style>
