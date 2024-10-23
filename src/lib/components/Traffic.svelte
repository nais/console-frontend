<script lang="ts">
	import { graphql, IngressType, type ValueOf } from '$houdini';
	import Globe from '$lib/icons/Globe.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Tooltip } from '@nais/ds-svelte-community';
	import { HouseIcon, PadlockLockedIcon } from '@nais/ds-svelte-community/icons';
	import type { WorkloadTrafficVariables } from './$houdini';

	export const _WorkloadTrafficVariables: WorkloadTrafficVariables = () => {
		return { id: workloadID };
	};

	export const traffic = graphql(`
		query WorkloadTraffic($id: ID!) @load {
			node(id: $id) {
				__typename
				... on Job {
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
				}
				... on Application {
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
					ingresses {
						url
						type
					}
				}
			}
		}
	`);

	export let workloadID: string;

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

{#if $traffic.data?.node}
	{@const t = $traffic.data.node}
	<div class="traffic">
		<div class="directionContent first">
			<h5>Inbound</h5>
			{#if t.__typename === 'Application'}
				<h6>External ingresses</h6>
				<ul>
					{#each externalIngresses(t.ingresses) as ingress}
						<li>
							<Globe /><a href={ingress.url}>{ingress.url}</a>
						</li>
					{:else}
						<li>No external ingresses</li>
					{/each}
				</ul>
				<h6>Internal ingresses</h6>
				<ul>
					{#each internalIngresses(t.ingresses) as ingress}
						<li><HouseIcon /><a href={ingress.url}>{ingress.url}</a></li>
					{:else}
						<li>No internal ingresses</li>
					{/each}
				</ul>
				<h6>Authenticated ingresses</h6>
				<ul>
					{#each authenticatedIngresses(t.ingresses) as ingress}
						<li><PadlockLockedIcon /><a href={ingress.url}>{ingress.url}</a></li>
					{:else}
						<li>No authenticated ingresses</li>
					{/each}
				</ul>
			{/if}
			{#if t.__typename === 'Application' || t.__typename === 'Job'}
				<h6>Applications</h6>
				<ul>
					{#each t.networkPolicy.inbound.rules as rule}
						<li>
							{#if !rule.mutual}
								<Tooltip
									placement="right"
									content="{rule.targetWorkloadName} is missing outbound policy for {String(
										t.name
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

								in {t.environment.name}
							{:else if rule.targetWorkload?.type === 'Job'}
								{#if !rule.targetWorkload}
									{rule.targetWorkloadName}.{rule.targetTeamSlug}
								{:else}
									<a
										href="/team/{rule.targetTeamSlug}/{t.environment
											.name}/job/{rule.targetWorkloadName}"
										>{rule.targetWorkloadName}.{rule.targetTeamSlug}</a
									>
								{/if}
							{:else if !rule.targetWorkload}
								{rule.targetWorkloadName}.{rule.targetTeamSlug}
							{:else}
								<a
									href="/team/{rule.targetTeamSlug || t.team.slug}/{t.environment
										.name}/app/{rule.targetWorkloadName}"
									>{rule.targetWorkloadName}{rule.targetTeamSlug
										? '.' + rule.targetTeamSlug
										: ''}</a
								>
							{/if}
						</li>
					{:else}
						<li>No inbound access policy</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div class="directionContent">
			<h5>Outbound</h5>
			{#if t.__typename === 'Application' || t.__typename === 'Job'}
				<h6>External hostnames</h6>
				<ul>
					{#each t.networkPolicy.outbound.external.filter((e) => e.target) as external}
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
						<li>No outbound external hosts in access policy</li>
					{/each}
				</ul>
				<h6>External IPs</h6>
				<ul>
					{#each t.networkPolicy.outbound.external.filter((e) => e.ports) as external}
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
						<li>No outbound external IPs in access policy</li>
					{/each}
				</ul>
				<h6>Applications</h6>
				<ul>
					{#each t.networkPolicy.outbound.rules as rule}
						<li>
							{#if !rule.mutual}
								<Tooltip
									placement="right"
									content="{rule.targetWorkloadName} is missing inbound policy for {String(t.name)}"
									><WarningIcon size="1rem" style="color: var(--a-icon-warning)" /></Tooltip
								>
							{/if}
							{#if rule.targetWorkloadName == '*'}
								Any app
								{#if rule.targetWorkloadName == '*'}
									from any namespace
								{:else}
									in {rule.targetTeamSlug}
								{/if}

								in {t.environment.name}
							{:else if rule.targetWorkload?.type === 'Job'}
								<a
									href="/team/{rule.targetTeamSlug}/{t.environment
										.name}/job/{rule.targetWorkloadName}"
									>{rule.targetWorkloadName}.{rule.targetTeamSlug}</a
								>
							{:else}
								<a
									href="/team/{rule.targetTeamSlug}/{t.environment
										.name}/app/{rule.targetWorkloadName}"
									>{rule.targetWorkloadName}.{rule.targetTeamSlug}</a
								>
							{/if}
						</li>
					{:else}
						<li>No outbound access policy</li>
					{/each}
				</ul>
			{/if}
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
