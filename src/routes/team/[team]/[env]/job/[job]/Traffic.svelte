<script lang="ts">
	import { page } from '$app/stores';
	import type { JobNetworkPolicy } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import Globe from '$lib/icons/Globe.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Tooltip } from '@nais/ds-svelte-community';

	interface Props {
		job: JobNetworkPolicy;
	}

	let { job }: Props = $props();

	let data = $derived(
		fragment(
			job,
			graphql(`
				fragment JobNetworkPolicy on Job {
					name
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
			`)
		)
	);
	let env = $derived($page.params.env);
	let team = $derived($page.params.team);
</script>

<div class="traffic">
	<div class="directionContent first">
		<h5>Inbound</h5>
		<h6>Applications</h6>
		<ul>
			{#each $data.networkPolicy.inbound.rules as rule}
				<li>
					{#if !rule.mutual}
						<Tooltip
							placement="right"
							content="{rule.targetWorkloadName} is missing outbound policy for {String(
								$data.name
							)}"><WarningIcon size="1rem" style="color: var(--a-icon-warning)" /></Tooltip
						>
					{/if}{#if rule.targetWorkloadName == '*'}
						Any workload
						{#if rule.targetTeamSlug == '*'}
							from any namespace
						{:else}
							in {rule.targetTeamSlug}
						{/if}

						in {env}
					{:else if rule.targetWorkload?.type === 'Job'}
						{#if !rule.targetWorkload}
							{rule.targetWorkloadName}.{rule.targetTeamSlug}
						{:else}
							<a href="/team/{rule.targetTeamSlug}/{env}/job/{rule.targetWorkloadName}"
								>{rule.targetWorkloadName}.{rule.targetTeamSlug}</a
							>
						{/if}
					{:else if !rule.targetWorkload}
						{rule.targetWorkloadName}.{rule.targetTeamSlug}
					{:else}
						<a href="/team/{rule.targetTeamSlug || team}/{env}/app/{rule.targetWorkloadName}"
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
			{#each $data.networkPolicy.outbound.external.filter((e) => e.target) as external}
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
				<li>No outbound external access policy</li>
			{/each}
		</ul>
		<h6>External IPs</h6>
		<ul>
			{#each $data.networkPolicy.outbound.external.filter((e) => e.ports) as external}
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
				<li>No outbound external access policy</li>
			{/each}
		</ul>
		<h6>Applications</h6>
		<ul>
			{#each $data.networkPolicy.outbound.rules as rule}
				<li>
					{#if !rule.mutual}
						<Tooltip
							placement="right"
							content="{rule.targetWorkloadName} is missing inbound policy for {String($data.name)}"
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

						in {env}
					{:else if rule.targetWorkload?.type === 'Job'}
						<a href="/team/{rule.targetTeamSlug}/{env}/job/{rule.targetWorkloadName}"
							>{rule.targetWorkloadName}.{rule.targetTeamSlug}</a
						>
					{:else}
						<a href="/team/{rule.targetTeamSlug}/{env}/app/{rule.targetWorkloadName}"
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
