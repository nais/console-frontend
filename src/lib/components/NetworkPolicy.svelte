<script lang="ts">
	import { fragment, graphql, type NetworkPolicy, type NetworkPolicy$data } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Heading, Tag } from '@nais/ds-svelte-community';
	import { GlobeIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from './IconLabel.svelte';
	import TooltipAlignHack from './TooltipAlignHack.svelte';
	import WorkloadLink from './WorkloadLink.svelte';

	interface Props {
		workload: NetworkPolicy;
	}

	let { workload }: Props = $props();

	let data = $derived(
		fragment(
			workload,
			graphql(`
				fragment NetworkPolicy on Workload {
					__typename
					name
					teamEnvironment {
						environment {
							name
						}
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
									__typename
									name
									team {
										slug
									}
									teamEnvironment {
										environment {
											name
										}
									}
								}
							}
						}
						outbound {
							rules {
								mutual
								targetTeamSlug
								targetWorkloadName
								targetWorkload {
									__typename
									name
									team {
										slug
									}
									teamEnvironment {
										environment {
											name
										}
									}
								}
							}
							external {
								__typename
								ports
								target
							}
						}
					}
				}
			`)
		)
	);

	type NetworkPolicyRule = NetworkPolicy$data['networkPolicy']['inbound' | 'outbound']['rules'][0];
</script>

{#snippet networkPolicyRule(rule: NetworkPolicyRule)}
	{#if rule.targetWorkloadName === '*'}
		Any workload
		{#if rule.targetTeamSlug === '*'}
			in any namespace
		{:else}
			in {rule.targetTeamSlug}
		{/if}
		in <Tag size="small" variant={envTagVariant($data.teamEnvironment.environment.name)}
			>{$data.teamEnvironment.environment.name}</Tag
		> can access {$data.name}.
	{:else if !rule.mutual && rule.targetWorkload}
		<WorkloadLink
			workload={rule.targetWorkload}
			warning="{rule.targetWorkloadName} is missing outbound policy to {$data.name}"
		/>
	{:else if rule.targetWorkload}
		<WorkloadLink workload={rule.targetWorkload} />
	{:else}
		<IconLabel label={rule.targetWorkloadName} description={rule.targetTeamSlug}>
			{#snippet icon()}
				<TooltipAlignHack content="Invalid workload reference">
					<WarningIcon />
				</TooltipAlignHack>
			{/snippet}
		</IconLabel>
	{/if}
{/snippet}

<Heading level="2" size="medium" spacing>Network Policy</Heading>
{#if $data.networkPolicy.inbound.rules.length > 0 || $data.networkPolicy.outbound.rules.length > 0 || $data.networkPolicy.outbound.external.length > 0}
	<div class="grid">
		<div>
			<Heading level="3" size="small" spacing>Inbound</Heading>
			<ul>
				{#each $data.networkPolicy.inbound.rules as rule (rule)}
					<li>
						{@render networkPolicyRule(rule)}
					</li>
				{:else}
					<li>
						No inbound network policies configured for this {$data.__typename?.toLowerCase()}.
					</li>
				{/each}
			</ul>
		</div>

		<div>
			<Heading level="3" size="small" spacing>Outbound</Heading>
			{#if $data.networkPolicy.outbound.rules.length > 0 || $data.networkPolicy.outbound.external.length > 0}
				<Heading level="4" size="xsmall" spacing>External</Heading>
				<ul>
					{#each Object.entries(Object.groupBy($data.networkPolicy.outbound.external, (e) => e.__typename ?? 'none')) as [type, list = []] (type)}
						{#each list as external (external)}
							{#each external.ports as port (port)}
								<li><IconLabel label="https://{external.target}:{port}" icon={GlobeIcon} /></li>
							{:else}
								<li><IconLabel label="https://{external.target}" icon={GlobeIcon} /></li>
							{/each}
						{/each}
					{:else}
						<li>
							No external outbound network policies configured for this {$data.__typename?.toLowerCase()}.
						</li>
					{/each}
				</ul>
				{#if $data.networkPolicy.outbound.rules.length > 0}
					<Heading level="4" size="xsmall" spacing>Workloads</Heading>
					<ul>
						{#each $data.networkPolicy.outbound.rules as rule (rule)}
							<li>
								{@render networkPolicyRule(rule)}
							</li>
						{/each}
					</ul>
				{/if}
			{:else}
				No outbound network policies configured for this {$data.__typename?.toLowerCase()}.
			{/if}
		</div>
	</div>
{:else}
	No network policies configured for this {$data.__typename?.toLowerCase()}.
{/if}

<style>
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0 0 1rem 0;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}
</style>
