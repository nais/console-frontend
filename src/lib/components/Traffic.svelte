<script lang="ts">
	import { fragment, graphql, IngressType, type Traffic, type ValueOf } from '$houdini';
	import Globe from '$lib/icons/Globe.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Tooltip } from '@nais/ds-svelte-community';
	import { HouseIcon, PadlockLockedIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		workload: Traffic;
	}

	let { workload }: Props = $props();

	let traffic = $derived(
		fragment(
			workload,
			graphql(`
				fragment Traffic on Workload {
					__typename
					name
					environment {
						name
					}
					team {
						slug
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
					... on Application {
						ingresses {
							url
							type
						}
					}
				}
			`)
		)
	);

	const externalIngresses = (
		ingresses: {
			readonly url: string;
			readonly type: ValueOf<typeof IngressType>;
		}[]
	) => {
		return ingresses.filter((ingress) => ingress.type === IngressType.EXTERNAL);
	};

	const internalIngresses = (
		ingresses: {
			readonly url: string;
			readonly type: ValueOf<typeof IngressType>;
		}[]
	) => {
		return ingresses.filter((ingress) => ingress.type === IngressType.INTERNAL);
	};

	const authenticatedIngresses = (
		ingresses: {
			readonly url: string;
			readonly type: ValueOf<typeof IngressType>;
		}[]
	) => {
		return ingresses.filter((ingress) => ingress.type === IngressType.AUTHENTICATED);
	};
</script>

<div class="traffic">
	<div class="directionContent first">
		<h5>Inbound</h5>
		{#if $traffic.__typename === 'Application'}
			<h6>External ingresses</h6>
			<ul>
				{#each externalIngresses($traffic.ingresses) as ingress}
					<li>
						<Globe /><a href={ingress.url}>{ingress.url}</a>
					</li>
				{:else}
					<li>No external ingresses</li>
				{/each}
			</ul>
			<h6>Internal ingresses</h6>
			<ul>
				{#each internalIngresses($traffic.ingresses) as ingress}
					<li><HouseIcon /><a href={ingress.url}>{ingress.url}</a></li>
				{:else}
					<li>No internal ingresses</li>
				{/each}
			</ul>
			<h6>Authenticated ingresses</h6>
			<ul>
				{#each authenticatedIngresses($traffic.ingresses) as ingress}
					<li><PadlockLockedIcon /><a href={ingress.url}>{ingress.url}</a></li>
				{:else}
					<li>No authenticated ingresses</li>
				{/each}
			</ul>
		{/if}
		<h6>Applications</h6>
		<ul>
			{#each $traffic.networkPolicy.inbound.rules as rule}
				<li>
					{#if !rule.mutual}
						<Tooltip
							placement="right"
							content="{rule.targetWorkloadName} is missing outbound policy for {String(
								$traffic.name
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

						in {$traffic.environment.name}
					{:else if rule.targetWorkload?.type === 'Job'}
						{#if !rule.targetWorkload}
							{rule.targetWorkloadName}.{rule.targetTeamSlug}
						{:else}
							<a
								href="/team/{rule.targetTeamSlug}/{$traffic.environment
									.name}/job/{rule.targetWorkloadName}"
								>{rule.targetWorkloadName}.{rule.targetTeamSlug}</a
							>
						{/if}
					{:else if !rule.targetWorkload}
						{rule.targetWorkloadName}.{rule.targetTeamSlug}
					{:else}
						<a
							href="/team/{rule.targetTeamSlug || $traffic.team.slug}/{$traffic.environment
								.name}/app/{rule.targetWorkloadName}"
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
			{#each $traffic.networkPolicy.outbound.external.filter((e) => e.type === 'ExternalNetworkPolicyHost') as external}
				{#each external.ports as port}
					<li>
						<Globe /><a href="{external.target}:{port}">{external.target}:{port}</a><br />
					</li>
				{:else}
					<li>
						<Globe /><a href="https://{external.target}">https://{external.target}</a><br />
					</li>
				{/each}
			{:else}
				<li>No outbound external hosts in access policy</li>
			{/each}
		</ul>
		<h6>External IPs</h6>
		<ul>
			{#each $traffic.networkPolicy.outbound.external.filter((e) => e.type === 'ExternalNetworkPolicyIpv4') as external}
				{#each external.ports as port}
					<li>
						<Globe />{external.target}:{port}<br />
					</li>
				{:else}
					<li><Globe />{external.target}<br /></li>
				{/each}
			{:else}
				<li>No outbound external IPs in access policy</li>
			{/each}
		</ul>
		<h6>Applications</h6>
		<ul>
			{#each $traffic.networkPolicy.outbound.rules as rule}
				<li>
					{#if !rule.mutual}
						<Tooltip
							placement="right"
							content="{rule.targetWorkloadName} is missing inbound policy for {String(
								$traffic.name
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

						in {$traffic.environment.name}
					{:else if rule.targetWorkload?.type === 'Job'}
						<a
							href="/team/{rule.targetTeamSlug}/{$traffic.environment
								.name}/job/{rule.targetWorkloadName}"
							>{rule.targetWorkloadName}.{rule.targetTeamSlug}</a
						>
					{:else}
						<a
							href="/team/{rule.targetTeamSlug}/{$traffic.environment
								.name}/app/{rule.targetWorkloadName}"
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
