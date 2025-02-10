<script lang="ts">
	import { fragment, graphql, type NetworkPolicy } from '$houdini';
	import Globe from '$lib/icons/Globe.svelte';
	import { Heading, Label } from '@nais/ds-svelte-community';
	import {
		ExclamationmarkTriangleFillIcon,
		QuestionmarkIcon
	} from '@nais/ds-svelte-community/icons';
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

{#if $data.networkPolicy.inbound.rules.length > 0 || $data.networkPolicy.outbound.rules.length > 0 || $data.networkPolicy.outbound.external.length > 0}
	<Heading level="2" size="medium" spacing>Network policy</Heading>

	<div class="grid">
		{#if $data.networkPolicy.inbound.rules.length > 0}
			<div class="direction-content">
				<Heading level="3" size="small" spacing>Inbound</Heading>
				<ul>
					{#each $data.networkPolicy.inbound.rules.filter((rule) => rule.targetWorkload) as rule}
						<li>
							{#if rule.targetWorkloadName == '*'}
								Any app
								{#if rule.targetWorkloadName == '*'}
									from any namespace
								{:else}
									in {rule.targetTeamSlug}
								{/if}

								in {$data.environment.name}
							{:else if rule.targetWorkload}
								<WorkloadLink workload={rule.targetWorkload} showIcon={true} size="medium" />
							{:else}
								<span>{rule.targetWorkloadName}</span>
							{/if}
						</li>
					{/each}
				</ul>
				{#if $data.networkPolicy.inbound.rules.filter((rule) => !rule.targetWorkload || !rule.mutual).length > 0}
					<div class="header">
						<div class="type-icon-header">
							<ExclamationmarkTriangleFillIcon />
						</div>
						<div>
							<Heading level="4" size="xsmall">Inbound rule warnings</Heading>
						</div>
					</div>

					{#if $data.networkPolicy.inbound.rules
						.filter((rule) => !rule.mutual)
						.filter((rule) => rule.targetWorkload).length > 0}
						<Label size="small">
							These workloads are missing an outbound policy to {$data.name}</Label
						>
						<ul>
							{#each $data.networkPolicy.inbound.rules.filter((rule) => !rule.mutual) as rule}
								<li>
									{#if rule.targetWorkload}
										<WorkloadLink workload={rule.targetWorkload} showIcon={true} size="medium" />
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
					{#if $data.networkPolicy.inbound.rules.filter((rule) => !rule.targetWorkload).length > 0}
						<Label size="small"
							>Invalid workload reference{$data.networkPolicy.inbound.rules.filter(
								(rule) => !rule.targetWorkload
							).length > 1
								? 's'
								: ''}
						</Label>
						<ul>
							{#each $data.networkPolicy.inbound.rules.filter((rule) => !rule.targetWorkload) as rule}
								<li>
									<IconWithText text={rule.targetWorkloadName} icon={QuestionmarkIcon}
									></IconWithText>
								</li>
							{/each}
						</ul>
					{/if}
				{/if}
			</div>
		{/if}
		{#if $data.networkPolicy.outbound.rules.length > 0 || $data.networkPolicy.outbound.external.length > 0}
			<div class="direction-content">
				<Heading level="3" size="small" spacing>Outbound</Heading>
				{#if $data.networkPolicy.outbound.external.length > 0}
					<Heading level="4" size="xsmall" spacing>External</Heading>
					<ul>
						{#each $data.networkPolicy.outbound.external.filter((e) => e.__typename === 'ExternalNetworkPolicyHost') as external}
							{#each external.ports as port}
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

						{#each $data.networkPolicy.outbound.external.filter((e) => e.__typename === 'ExternalNetworkPolicyIpv4') as external}
							{#each external.ports as port}
								<li>
									<IconWithText text={`${external.target}:${port}`} size="medium" icon={Globe} />
								</li>
							{:else}
								<li><IconWithText text={`${external.target}`} size="medium" icon={Globe} /></li>
							{/each}
						{/each}
					</ul>
				{/if}
				{#if $data.networkPolicy.outbound.rules.filter((rule) => rule.targetWorkload).length > 0}
					<Heading level="4" size="xsmall" spacing>Workloads</Heading>
					<ul>
						{#each $data.networkPolicy.outbound.rules.filter((rule) => rule.targetWorkload) as rule}
							<li>
								{#if rule.targetWorkloadName == '*'}
									Any app
									{#if rule.targetWorkloadName == '*'}
										from any namespace
									{:else}
										in {rule.targetTeamSlug}
									{/if}

									in {$data.environment.name}
								{:else if rule.targetWorkload}
									<WorkloadLink workload={rule.targetWorkload} showIcon={true} size="medium" />
								{:else}
									<span>{rule.targetWorkloadName}</span>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</div>
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

	.header {
		display: flex;
		align-items: center;
		font-size: 1.25rem;
		gap: var(--a-spacing-1-alt);
	}

	.type-icon-header {
		display: flex;
		flex-direction: row;
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
