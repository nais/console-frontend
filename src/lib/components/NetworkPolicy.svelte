<script lang="ts">
	import { fragment, graphql, type NetworkPolicy } from '$houdini';
	import Globe from '$lib/icons/Globe.svelte';
	import { Heading, Tooltip } from '@nais/ds-svelte-community';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
	import IconWithText from './IconWithText.svelte';
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
									__typename
									name
									team {
										slug
									}
									environment {
										name
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
									environment {
										name
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
</script>

<Heading level="2" size="medium" spacing>Network policy</Heading>
{#if $data.networkPolicy.inbound.rules.length > 0 || $data.networkPolicy.outbound.rules.length > 0 || $data.networkPolicy.outbound.external.length > 0}
	<div class="grid">
		<div class="direction-content">
			<Heading level="3" size="small" spacing>Inbound</Heading>
			{#if $data.networkPolicy.inbound.rules.length > 0}
				<ul>
					{#each $data.networkPolicy.inbound.rules as rule (rule.targetWorkloadName + rule.targetTeamSlug)}
						<li>
							{#if rule.targetWorkloadName == '*'}
								Any app
								{#if rule.targetWorkloadName == '*'}
									from any namespace
								{:else}
									in {rule.targetTeamSlug}
								{/if}

								in {$data.environment.name}
							{:else if !rule.mutual && rule.targetWorkload}
								<WorkloadLink
									workload={rule.targetWorkload}
									showIcon={true}
									size="medium"
									warningMessage="Workload is missing outbound policy to {$data.name}"
								/>
							{:else if !rule.mutual && !rule.targetWorkload}
								<Tooltip content="Invalid workload reference">
									<IconWithText size="medium" description={rule.targetTeamSlug}>
										{#snippet icon()}
											<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-warning)" />
										{/snippet}
										{#snippet text()}
											<span>{rule.targetWorkloadName}</span>
										{/snippet}
									</IconWithText>
								</Tooltip>
							{:else if rule.targetWorkload}
								<WorkloadLink workload={rule.targetWorkload} showIcon={true} size="medium" />
							{:else}
								<span>{rule.targetWorkloadName}</span>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<li>No inbound network policies configured for this app.</li>
			{/if}
		</div>

		<div class="direction-content">
			<Heading level="3" size="small" spacing>Outbound</Heading>
			{#if $data.networkPolicy.outbound.rules.length > 0 || $data.networkPolicy.outbound.external.length > 0}
				{#if $data.networkPolicy.outbound.external.length > 0}
					<Heading level="4" size="xsmall" spacing>External</Heading>
					<ul>
						{#each $data.networkPolicy.outbound.external.filter((e) => e.__typename === 'ExternalNetworkPolicyHost') as external (external.__typename + external.target + external.ports)}
							{#each external.ports as port (port)}
								<li>
									<IconWithText
										text={`https://${external.target}:${port}`}
										size="medium"
										icon={Globe}
									/>
								</li>
							{:else}
								<li>
									<IconWithText text={`https://${external.target}`} size="medium" icon={Globe} />
								</li>
							{/each}
						{/each}

						{#each $data.networkPolicy.outbound.external.filter((e) => e.__typename === 'ExternalNetworkPolicyIpv4') as external (external.__typename + external.target + external.ports)}
							{#each external.ports as port (port)}
								<li>
									<IconWithText text={`${external.target}:${port}`} size="medium" icon={Globe} />
								</li>
							{:else}
								<li><IconWithText text={`${external.target}`} size="medium" icon={Globe} /></li>
							{/each}
						{/each}
					</ul>
				{/if}
				{#if $data.networkPolicy.outbound.rules.length > 0}
					<Heading level="4" size="xsmall" spacing>Workloads</Heading>
					<ul>
						{#each $data.networkPolicy.outbound.rules as rule (rule.targetWorkloadName + rule.targetTeamSlug)}
							<li>
								{#if rule.targetWorkloadName == '*'}
									Any app
									{#if rule.targetWorkloadName == '*'}
										from any namespace
									{:else}
										in {rule.targetTeamSlug}
									{/if}

									in {$data.environment.name}
								{:else if !rule.mutual && rule.targetWorkload}
									<WorkloadLink
										workload={rule.targetWorkload}
										showIcon={true}
										size="medium"
										warningMessage="Workload is missing outbound policy to {$data.name}"
									/>
								{:else if !rule.mutual && !rule.targetWorkload}
									<Tooltip content="Invalid workload reference">
										<IconWithText size="medium" description={rule.targetTeamSlug}>
											{#snippet icon()}
												<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-warning)" />
											{/snippet}
											{#snippet text()}
												<span>{rule.targetWorkloadName}</span>
											{/snippet}
										</IconWithText>
									</Tooltip>
								{:else if rule.targetWorkload}
									<WorkloadLink workload={rule.targetWorkload} showIcon={true} size="medium" />
								{:else}
									<span>{rule.targetWorkloadName}</span>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			{:else}
				No outbound network policies configured for this app.
			{/if}
		</div>
	</div>
{:else}
	No network policies configured for this app.
{/if}

<style>
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}
	.direction-content {
		padding: 1rem;
	}

	.direction-content,
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
