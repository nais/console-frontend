<script lang="ts">
	import { fragment, graphql, type NetworkPolicy, type NetworkPolicy$data } from '$houdini';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { GlobeIcon } from '@nais/ds-svelte-community/icons';

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

	let hasPolicy = $derived(
		$data.networkPolicy.inbound.rules.length > 0 ||
			$data.networkPolicy.outbound.rules.length > 0 ||
			$data.networkPolicy.outbound.external.length > 0
	);
</script>

{#snippet networkPolicyRule(rule: NetworkPolicyRule)}
	{#if rule.targetWorkloadName === '*'}
		Any workload
		{#if rule.targetTeamSlug === '*'}
			in any namespace
		{:else}
			in {rule.targetTeamSlug}
		{/if}
		in <Tag size="xsmall" variant={envTagVariant($data.teamEnvironment.environment.name)}
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

{#if hasPolicy}
	<SurfaceCard title="Network policy">
		<div class="grid">
			<div class="direction">
				<BodyShort size="small"><strong>Inbound</strong></BodyShort>
				<ul>
					{#each $data.networkPolicy.inbound.rules as rule (rule)}
						<li>
							{@render networkPolicyRule(rule)}
						</li>
					{:else}
						<li class="empty">No inbound policies configured.</li>
					{/each}
				</ul>
			</div>

			<div class="direction">
				<BodyShort size="small"><strong>Outbound</strong></BodyShort>
				{#if $data.networkPolicy.outbound.rules.length > 0 || $data.networkPolicy.outbound.external.length > 0}
					{#if $data.networkPolicy.outbound.external.length > 0}
						<BodyShort size="small" textColor="subtle">External</BodyShort>
						<ul>
							{#each Object.entries(Object.groupBy($data.networkPolicy.outbound.external, (e) => e.__typename ?? 'none')) as [type, list = []] (type)}
								{#each list as external (external)}
									{#each external.ports as port (port)}
										<li>
											<IconLabel label="https://{external.target}:{port}" icon={GlobeIcon} />
										</li>
									{:else}
										<li>
											<IconLabel label="https://{external.target}" icon={GlobeIcon} />
										</li>
									{/each}
								{/each}
							{/each}
						</ul>
					{/if}
					{#if $data.networkPolicy.outbound.rules.length > 0}
						<BodyShort size="small" textColor="subtle">Workloads</BodyShort>
						<ul>
							{#each $data.networkPolicy.outbound.rules as rule (rule)}
								<li>
									{@render networkPolicyRule(rule)}
								</li>
							{/each}
						</ul>
					{/if}
				{:else}
					<BodyShort size="small" textColor="subtle">No outbound policies configured.</BodyShort>
				{/if}
			</div>
		</div>
	</SurfaceCard>
{:else}
	<SurfaceCard title="Network policy">
		<BodyShort size="small" textColor="subtle">No network policies configured.</BodyShort>
	</SurfaceCard>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ax-space-24);
		min-width: 0;
	}

	.direction {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		min-width: 0;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		min-width: 0;
		font-size: var(--ax-font-size-small);
	}

	li {
		min-width: 0;
	}

	li :global(*) {
		min-width: 0;
	}

	.empty {
		color: var(--ax-text-neutral-subtle);
	}

	@media (max-width: 767px), (max-height: 500px) {
		.grid {
			grid-template-columns: 1fr;
			gap: var(--ax-space-16);
		}
	}
</style>
