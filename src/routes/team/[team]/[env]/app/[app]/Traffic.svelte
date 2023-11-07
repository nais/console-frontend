<script lang="ts">
	import { page } from '$app/stores';
	import type { AccessPolicy } from '$houdini';
	import { fragment, graphql, PendingValue } from '$houdini';
	import Globe from '$lib/icons/Globe.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Loading from '$lib/Loading.svelte';
	import { Tooltip } from '@nais/ds-svelte-community';

	export let app: AccessPolicy;

	$: data = fragment(
		app,
		graphql(`
			fragment AccessPolicy on App @loading {
				name
				ingresses @loading
				accessPolicy {
					inbound {
						rules {
							application @loading
							namespace
							cluster
							mutual
							mutualExplanation
							isJob
						}
					}
					outbound {
						rules {
							application @loading
							namespace
							cluster
							mutual
							mutualExplanation
							isJob
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

{#if $data}
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
							{#if !rule.mutual}
								<Tooltip
									placement="right"
									content="{rule.application} is missing outbound policy for {String($data.name)}"
									><WarningIcon size="1rem" style="color: var(--a-icon-warning)" /></Tooltip
								>
							{/if}
							{#if rule.application == '*'}
								Any app
								{#if rule.namespace == '*'}
									from any namespace
								{:else}
									in {rule.namespace}
								{/if}
								{#if rule.cluster == '*'}
									in any cluster
								{:else}
									in {env}
								{/if}
							{:else if rule.isJob}
								{#if rule.mutualExplanation === 'APP_NOT_FOUND'}
									{rule.application}{rule.namespace ? '.' + rule.namespace : ''}{rule.cluster
										? '.' + rule.cluster
										: ''}
								{:else}
									<a
										href="/team/{rule.namespace || team}/{rule.cluster
											? rule.cluster
											: env}/job/{rule.application}"
										>{rule.application}{rule.namespace ? '.' + rule.namespace : ''}{rule.cluster
											? '.' + rule.cluster
											: ''}</a
									>
								{/if}
							{:else if rule.mutualExplanation === 'APP_NOT_FOUND'}
								{rule.application}{rule.namespace ? '.' + rule.namespace : ''}{rule.cluster
									? '.' + rule.cluster
									: ''}
							{:else if rule.mutualExplanation === 'LOCALHOST'}
								{rule.application}{rule.namespace ? '.' + rule.namespace : ''}{rule.cluster
									? '.' + rule.cluster
									: ''}
							{:else}
								<a
									href="/team/{rule.namespace || team}/{rule.cluster
										? rule.cluster
										: env}/app/{rule.application}"
									>{rule.application}{rule.namespace ? '.' + rule.namespace : ''}{rule.cluster
										? '.' + rule.cluster
										: ''}</a
								>
							{/if}
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
							<li><Globe /><a href="https://{external.host}">https://{external.host}</a><br /></li>
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
							{#if !rule.mutual}
								<Tooltip
									placement="right"
									content="{rule.application} is missing inbound policy for {String($data.name)}"
									><WarningIcon size="1rem" style="color: var(--a-icon-warning)" /></Tooltip
								>
							{/if}
							{#if rule.application == '*'}
								Any app
								{#if rule.namespace == '*'}
									from any namespace
								{:else}
									in {rule.namespace}
								{/if}
								{#if rule.cluster == '*'}
									in any cluster
								{:else}
									in {env}
								{/if}
							{:else if rule.isJob}
								<a
									href="/team/{rule.namespace || team}/{rule.cluster
										? rule.cluster
										: env}/job/{rule.application}"
									>{rule.application}{rule.namespace ? '.' + rule.namespace : ''}{rule.cluster
										? '.' + rule.cluster
										: ''}</a
								>
							{:else}
								<a
									href="/team/{rule.namespace || team}/{rule.cluster
										? rule.cluster
										: env}/app/{rule.application}"
									>{rule.application}{rule.namespace ? '.' + rule.namespace : ''}{rule.cluster
										? '.' + rule.cluster
										: ''}</a
								>
							{/if}
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
