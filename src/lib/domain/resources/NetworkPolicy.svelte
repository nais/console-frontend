<script lang="ts">
	import { fragment, graphql, type NetworkPolicy, type NetworkPolicy$data } from '$houdini';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import DocsLink from '#lib/ui/DocsLink.svelte';
	import IconLabel from '#lib/ui/IconLabel.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import TooltipAlignHack from '#lib/ui/TooltipAlignHack.svelte';
	import { BodyLong, Heading, Tag } from '#lib/shadcn/ui/index.js';
	import { ArrowLeftIcon, ArrowRightIcon, GlobeIcon, PackageIcon } from '#lib/icons/index.js';

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

	type FlatRule =
		| { direction: 'inbound' | 'outbound'; kind: 'workload'; rule: NetworkPolicyRule }
		| {
				direction: 'outbound';
				kind: 'external';
				external: NetworkPolicy$data['networkPolicy']['outbound']['external'][0];
		  };

	let flatRules = $derived.by(() => {
		const rules: FlatRule[] = [];

		for (const rule of $data.networkPolicy.inbound.rules) {
			rules.push({ direction: 'inbound', kind: 'workload', rule });
		}
		for (const rule of $data.networkPolicy.outbound.rules) {
			rules.push({ direction: 'outbound', kind: 'workload', rule });
		}
		for (const ext of $data.networkPolicy.outbound.external) {
			rules.push({ direction: 'outbound', kind: 'external', external: ext });
		}

		return rules;
	});
</script>

{#snippet workloadRule(rule: NetworkPolicyRule)}
	{#if rule.targetWorkloadName === '*'}
		<span class="wildcard">
			Any workload
			{#if rule.targetTeamSlug === '*'}
				in any namespace
			{:else}
				in {rule.targetTeamSlug}
			{/if}
		</span>
	{:else if rule.targetWorkload}
		<WorkloadLink workload={rule.targetWorkload} hideEnv />
	{:else}
		<IconLabel
			label={rule.targetWorkloadName}
			description={rule.targetTeamSlug}
			icon={PackageIcon}
		/>
	{/if}
{/snippet}

<div class="heading-row">
	<Heading as="h2" size="medium" spacing>Access policy</Heading>
	<div class="actions">
		<DocsLink path="/workloads/application/reference/application-spec/#accesspolicy" />
	</div>
</div>

<Collection headerless>
	{#if hasPolicy}
		<ul class="rules">
			{#each flatRules as entry, i (`${entry.direction}-${entry.kind}-${i}`)}
				<li class="rule">
					<span class="direction" class:inbound={entry.direction === 'inbound'}>
						{#if entry.direction === 'inbound'}
							<ArrowLeftIcon />
						{:else}
							<ArrowRightIcon />
						{/if}
						<span class="direction-label">{entry.direction === 'inbound' ? 'IN' : 'OUT'}</span>
					</span>

					<span class="target">
						{#if entry.kind === 'external'}
							<IconLabel
								label={entry.external.ports.length > 0
									? `${entry.external.target}:${entry.external.ports.join(', ')}`
									: entry.external.target}
								icon={GlobeIcon}
							/>
						{:else}
							{@render workloadRule(entry.rule)}
						{/if}
					</span>

					<span class="status">
						{#if entry.kind === 'external'}
							<TooltipAlignHack content="Traffic to an external destination outside this cluster.">
								<Tag size="xsmall" variant="neutral">External</Tag>
							</TooltipAlignHack>
						{:else if entry.rule.mutual}
							<TooltipAlignHack content="Both workloads allow traffic to each other.">
								<Tag size="xsmall" variant="success">Mutual</Tag>
							</TooltipAlignHack>
						{:else}
							<TooltipAlignHack
								content={entry.direction === 'inbound'
									? `${entry.rule.targetWorkloadName} is missing outbound policy to ${$data.name}`
									: `${entry.rule.targetWorkloadName} is missing inbound policy from ${$data.name}`}
							>
								<Tag size="xsmall" variant="warning">One-way</Tag>
							</TooltipAlignHack>
						{/if}
					</span>
				</li>
			{/each}
		</ul>
	{:else}
		<div class="empty-state">
			<BodyLong size="small" textColor="subtle">No access policies configured.</BodyLong>
		</div>
	{/if}
</Collection>

<style>
	.heading-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-16);
		flex-wrap: wrap;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
		flex-shrink: 0;
	}

	.rules {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.rule {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--ax-space-16);
		padding: var(--ax-space-12) var(--ax-space-20);
		border-bottom: var(--sh-border-width) solid var(--ax-border-neutral-subtleA);
		font-size: var(--ax-font-size-small);
		min-width: 0;
		transition: background-color 120ms ease;
	}

	.rule:hover {
		background-color: var(--ax-bg-neutral-soft);
	}

	.rule:last-child {
		border-bottom: none;
	}

	.direction {
		display: flex;
		align-items: center;
		gap: var(--ax-space-2);
		color: var(--ax-text-neutral-subtle);
		font-size: var(--ax-font-size-small);
		flex-shrink: 0;
		width: var(--ax-space-56);
	}

	.direction.inbound {
		color: var(--ax-text-accent);
	}

	.direction-label {
		font-weight: var(--ax-font-weight-bold);
	}

	.target {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.target :global(.icon-label) {
		font-size: var(--ax-font-size-large);
	}

	.target :global(*) {
		min-width: 0;
	}

	.status {
		justify-self: end;
	}

	.wildcard {
		color: var(--ax-text-neutral-subtle);
	}

	.empty-state {
		padding: var(--ax-space-12) var(--ax-space-24);
	}

	@container (max-width: 500px) {
		.rule {
			grid-template-columns: auto minmax(0, 1fr);
			column-gap: var(--ax-space-12);
			row-gap: var(--ax-space-8);
			padding-inline: var(--ax-space-16);
		}

		.status {
			grid-column: 2;
			justify-self: start;
		}
	}
</style>
