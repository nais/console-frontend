<script lang="ts">
	import { page } from '$app/stores';
	import { graphql, PendingValue, WorkloadState, type ValueOf } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';
	import { Skeleton } from '@nais/ds-svelte-community';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';
	import type { TeamInfoVariables } from './$houdini';

	export let teamName: string;

	export const _TeamInfoVariables: TeamInfoVariables = () => {
		return { team: teamName };
	};

	const teamInfo = graphql(`
		query TeamInfo($team: Slug!) @load {
			team(slug: $team) @loading {
				externalResources @loading {
					gitHubTeam @loading {
						slug @loading
					}
				}
				purpose @loading
				slackChannel @loading
				workloads @loading {
					nodes {
						status {
							state
						}
					}
				}
			}
		}
	`);
	const githubOrganization = get(page).data.githubOrganization;
	let status: string | undefined = undefined;

	$: {
		if ($teamInfo.data?.team.workloads !== PendingValue) {
			let states: ValueOf<typeof WorkloadState>[] = [];
			states =
				$teamInfo.data?.team.workloads.nodes?.map((node) => node.status.state) ??
				[].filter((state) => {
					if (state) {
						return true;
					}
					return false;
				});

			if (states.includes(WorkloadState.FAILING)) {
				status = WorkloadState.FAILING;
			} else if (states?.includes(WorkloadState.NOT_NAIS)) {
				status = WorkloadState.NOT_NAIS;
			} else if (states?.includes(WorkloadState.NAIS)) {
				status = WorkloadState.NAIS;
			} else if (states?.includes(WorkloadState.UNKNOWN)) {
				status = WorkloadState.UNKNOWN;
			} else {
				status = 'NAIS';
			}
		}
	}
</script>

<h4>Team summary</h4>
{#if $teamInfo.data}
	{@const t = $teamInfo.data.team}
	{#if t.purpose !== PendingValue}
		<p>{t.purpose}</p>
	{:else}
		<Skeleton variant="text" />
	{/if}

	{#if t.externalResources.gitHubTeam}
		<strong>GitHub team:</strong>
		{#if t.externalResources.gitHubTeam?.slug !== PendingValue}
			<a
				href="https://github.com/orgs/{githubOrganization}/teams/{t.externalResources.gitHubTeam
					.slug}"
			>
				{t.externalResources.gitHubTeam?.slug}
			</a>
		{:else}
			<Skeleton variant="text" />
		{/if}
		<br />
	{/if}

	{#if t.slackChannel}
		<strong>Slack channel:</strong>
		{#if t.slackChannel !== PendingValue}
			{t.slackChannel}
		{:else}
			<Skeleton variant="text" />
		{/if}
		<br />
	{/if}

	{#if status == 'NAIS'}
		<div class="nais">
			<Nais
				size="3rem"
				style="color: var(--a-icon-success)"
				aria-label="All workloads are Nais"
				role="image"
			/>
			<p>Keep up the good work!</p>
		</div>
	{:else if status == 'FAILING'}
		<div class="nais">
			<ExclamationmarkTriangleFillIcon
				height="3em"
				width="3em"
				style="color: var(--a-icon-danger)"
			/>
			<p>One or more workloads are failing</p>
		</div>
	{:else if status == 'NOT_NAIS'}
		<div class="nais">
			<ExclamationmarkTriangleFillIcon
				height="3em"
				width="3em"
				style="color: var(--a-icon-warning)"
			/>
			<p>One ore more workloads are having issues</p>
		</div>
	{:else}
		<p>Team status is unknown</p>
	{/if}
{/if}

<style>
	.nais {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 1rem;
	}
</style>
