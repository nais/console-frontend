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
</script>

{#if $traffic.networkPolicy.outbound.rules.length > 0 || $traffic.networkPolicy.outbound.external.length > 0}
	<Heading level="2" size="medium" spacing>Access control</Heading>
	<div class="traffic">
		<div class="directionContent">
			<Heading level="3" size="small" spacing>Outbound</Heading>
			{#if $traffic.networkPolicy.outbound.external.length > 0}
				<Heading level="4" size="xsmall" spacing>External</Heading>
				<ul>
					{#each $traffic.networkPolicy.outbound.external.filter((e) => e.__typename === 'ExternalNetworkPolicyHost') as external}
						{#each external.ports as port}
							<li>
								<IconWithText
									text={`https://${external.target}:${port}`}
									size="large"
									icon={Globe}
								/>
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
						{#if rule.targetWorkloadName == '*'}
							Any app
							{#if rule.targetWorkloadName == '*'}
								from any namespace
							{:else}
								in {rule.targetTeamSlug}
							{/if}

							in {$traffic.environment.name}
						{:else if rule.targetWorkload}
							<WorkloadLink workload={rule.targetWorkload} showIcon={true} size="medium" />
						{:else if !rule.mutual}
							<IconWithText text={rule.targetWorkloadName} size="medium">
								{#snippet icon()}
									<Tooltip
										content="{rule.targetWorkloadName} is missing inbound policy for {String(
											$traffic.name
										)}"
									>
										<WarningIcon style="color: var(--a-icon-warning)" />
									</Tooltip>
								{/snippet}
							</IconWithText>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}

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
