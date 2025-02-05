<script lang="ts">
	import { fragment, graphql, type TrafficV2 } from '$houdini';
	import Globe from '$lib/icons/Globe.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Heading, Tooltip } from '@nais/ds-svelte-community';
	import IconWithText from './IconWithText.svelte';
	import WorkloadLink from './WorkloadLink.svelte';

	interface Props {
		workload: TrafficV2;
	}

	let { workload }: Props = $props();

	let traffic = $derived(
		fragment(
			workload,
			graphql(`
				fragment TrafficV2 on Workload {
					__typename
					name
					environment {
						name
					}
					team {
						slug
					}
					networkPolicy {
						outbound {
							external {
								__typename
								ports
								target
							}
							rules {
								targetWorkloadName
								targetTeamSlug
								targetWorkload {
									__typename
									name
									team {
										slug
									}
									environment {
										name
									}
								}
								mutual
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

	/*const externalIngresses = (
		ingresses: {
			readonly url: string;
			readonly type: ValueOf<typeof IngressType>;
		}[]
	) => {
		return ingresses.filter((ingress) => ingress.type === IngressType.EXTERNAL);
	};*/

	/*const internalIngresses = (
		ingresses: {
			readonly url: string;
			readonly type: ValueOf<typeof IngressType>;
		}[]
	) => {
		return ingresses.filter((ingress) => ingress.type === IngressType.INTERNAL);
	};*/

	/*const authenticatedIngresses = (
		ingresses: {
			readonly url: string;
			readonly type: ValueOf<typeof IngressType>;
		}[]
	) => {
		return ingresses.filter((ingress) => ingress.type === IngressType.AUTHENTICATED);
	};*/
</script>

<Heading level="2" size="medium" spacing>Access control</Heading>
<div class="traffic">
	<!--div class="directionContent first">
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
					<li>
						<HouseIcon /><a href={ingress.url}>{ingress.url}</a>
					</li>
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
	</div-->

	<div class="directionContent">
		<Heading level="3" size="small" spacing>Outbound</Heading>
		{#if $traffic.networkPolicy.outbound.external.length > 0}
			<Heading level="4" size="xsmall" spacing>External</Heading>
			<ul>
				{#each $traffic.networkPolicy.outbound.external.filter((e) => e.__typename === 'ExternalNetworkPolicyHost') as external}
					{#each external.ports as port}
						<li>
							<IconWithText text={`https://${external.target}:${port}`} size="large" icon={Globe} />
						</li>
					{:else}
						<li>
							<IconWithText text={`https://${external.target}`} size="large" icon={Globe} />
						</li>
					{/each}
				{/each}

				{#each $traffic.networkPolicy.outbound.external.filter((e) => e.__typename === 'ExternalNetworkPolicyIpv4') as external}
					{#each external.ports as port}
						<li>
							<IconWithText text={`${external.target}:${port}`} size="large" icon={Globe} />
						</li>
					{:else}
						<li><IconWithText text={`${external.target}`} size="large" icon={Globe} /></li>
					{/each}
				{/each}
			</ul>
		{/if}
		<Heading level="4" size="xsmall" spacing>Workloads</Heading>
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
					{:else if rule.targetWorkload}
						<WorkloadLink workload={rule.targetWorkload} showIcon={true} size="large" />
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0 0 1rem 0;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--a-spacing-1);
		flex-direction: row;
		padding: 2px 4px;
	}
</style>
