<script lang="ts">
	import { page } from '$app/stores';
	import type { TrafficPolicy } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import Globe from '$lib/icons/Globe.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Tooltip } from '@nais/ds-svelte-community';
	import { HouseIcon, PadlockLockedIcon } from '@nais/ds-svelte-community/icons';

	export let app: TrafficPolicy;

	$: data = fragment(
		app,
		graphql(`
			fragment TrafficPolicy on Application {
				name
				ingresses {
					url
					type
				}
				networkPolicy {
					inbound {
						rules {
							mutual
							targetTeamSlug
							targetWorkloadName
							targetWorkload {
								type: __typename
							}
						}
					}
					outbound {
						rules {
							mutual
							targetTeamSlug
							targetWorkloadName
							targetWorkload {
								type: __typename
							}
						}
						external {
							type: __typename
							ports
							target
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

{#if $data}
	<div class="traffic">
		<div class="directionContent first">
			<h5>Inbound</h5>
			<h6>External ingresses</h6>
			<ul>
				{#each $data.ingresses as ingress}
					{#if ingress.type === 'EXTERNAL'}
						<li>
							<Globe /><a href={ingress.url}>{externalName(ingress.url)}</a>
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
					{#if ingress.type === 'INTERNAL'}
						<li><HouseIcon /><a href={ingress.url}>{internalName(ingress.url)}</a></li>
					{/if}
				{/each}
				{#if !hasInternal}
					<li>No internal ingresses</li>
				{/if}
			</ul>
			<h6>Authenticated ingresses</h6>
			<ul>
				{#each $data.ingresses as ingress}
					{#if ingress.type === 'AUTHENTICATED'}
						<li><PadlockLockedIcon /><a href={ingress.url}>{internalName(ingress.url)}</a></li>
					{/if}
				{/each}
				{#if !hasInternal}
					<li>No internal ingresses</li>
				{/if}
			</ul>
			<h6>Applications</h6>
			<ul>
				{#each $data.networkPolicy.inbound.rules as rule}
					<li>
						{#if !rule.mutual}
							<Tooltip
								placement="right"
								content="{rule.targetWorkloadName} is missing outbound policy for {String(
									$data.name
								)}"><WarningIcon size="1rem" style="color: var(--a-icon-warning)" /></Tooltip
							>
						{/if}
						{#if rule.targetWorkloadName == '*'}
							Any app
							{#if rule.targetTeamSlug == '*'}
								from any namespace
							{:else}
								in {rule.targetTeamSlug}
							{/if}

							in {env}
						{:else if rule.targetWorkload?.type === 'Job'}
							{#if !rule.targetWorkload}
								{rule.targetWorkloadName}.{rule.targetTeamSlug}
							{:else}
								<a href="/team/{rule.targetTeamSlug}/{env}/job/{rule.targetWorkloadName}"
									>{rule.targetWorkloadName}.{rule.targetTeamSlug}</a
								>
							{/if}
						{:else if !rule.targetWorkload}
							{rule.targetWorkloadName}.{rule.targetTeamSlug}
						{:else}
							<a href="/team/{rule.targetTeamSlug || team}/{env}/app/{rule.targetWorkloadName}"
								>{rule.targetWorkloadName}{rule.targetTeamSlug ? '.' + rule.targetTeamSlug : ''}</a
							>
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
				{#each $data.networkPolicy.outbound.external.filter((e) => e.target) as external}
					{#if external.type === 'ExternalNetworkPolicyHost'}
						{#each external.ports as port}
							<li>
								<Globe /><a href="{external.target}:{port}">{external.target}:{port}</a><br />
							</li>
						{:else}
							<li>
								<Globe /><a href="https://{external.target}">https://{external.target}</a><br />
							</li>
						{/each}
					{/if}
				{:else}
					<li>No outbound external access policy</li>
				{/each}
			</ul>
			<h6>External IPs</h6>
			<ul>
				{#each $data.networkPolicy.outbound.external.filter((e) => e.ports) as external}
					{#if external.type === 'ExternalNetworkPolicyIpv4'}
						{#each external.ports as port}
							<li>
								<Globe />{external.target}:{port}<br />
							</li>
						{:else}
							<li><Globe />{external.target}<br /></li>
						{/each}
					{/if}
				{:else}
					<li>No outbound external access policy</li>
				{/each}
			</ul>
			<h6>Applications</h6>
			<ul>
				{#each $data.networkPolicy.outbound.rules as rule}
					<li>
						{#if !rule.mutual}
							<Tooltip
								placement="right"
								content="{rule.targetWorkloadName} is missing inbound policy for {String(
									$data.name
								)}"><WarningIcon size="1rem" style="color: var(--a-icon-warning)" /></Tooltip
							>
						{/if}
						{#if rule.targetWorkloadName == '*'}
							Any app
							{#if rule.targetWorkloadName == '*'}
								from any namespace
							{:else}
								in {rule.targetTeamSlug}
							{/if}

							in {env}
						{:else if rule.targetWorkload?.type === 'Job'}
							<a href="/team/{rule.targetTeamSlug}/{env}/job/{rule.targetWorkloadName}"
								>{rule.targetWorkloadName}.{rule.targetTeamSlug}</a
							>
						{:else}
							<a href="/team/{rule.targetTeamSlug}/{env}/app/{rule.targetWorkloadName}"
								>{rule.targetWorkloadName}.{rule.targetTeamSlug}</a
							>
						{/if}
					</li>
				{:else}
					<li>No outbound access policy</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}

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
	h6 {
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
