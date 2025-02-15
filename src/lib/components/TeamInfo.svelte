<script lang="ts">
	import { page } from '$app/stores';
	import { graphql, PendingValue, WorkloadState, type ValueOf } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';
	import { Heading, Skeleton } from '@nais/ds-svelte-community';
	import {
		ExclamationmarkTriangleFillIcon,
		QuestionmarkIcon
	} from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';
	import type { TeamInfoVariables } from './$houdini';
	import IconWithText from './IconWithText.svelte';

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	export const _TeamInfoVariables: TeamInfoVariables = () => {
		return { team: teamSlug };
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
	let status: string | undefined = $state(undefined);
	$effect(() => {
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
				status = 'FAILING';
			} else if (states?.includes(WorkloadState.NOT_NAIS)) {
				status = 'NOT_NAIS';
			} else if (states?.includes(WorkloadState.NAIS)) {
				status = 'NAIS';
			} else if (states?.includes(WorkloadState.UNKNOWN)) {
				status = 'UNKNOWN';
			} else {
				status = 'NAIS';
			}
		}
	});
</script>

<Heading level="4" size="small" spacing>Team summary</Heading>

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
	<div class="nais">
		{#if status == 'NAIS'}
			<IconWithText icon={Nais} text="All workloads are Nais" size="medium" />
		{:else if status === 'FAILING'}
			<IconWithText
				icon={ExclamationmarkTriangleFillIcon}
				text="One or more workloads are failing"
				size="medium"
			/>
		{:else if status === 'NOT_NAIS'}
			<IconWithText
				icon={ExclamationmarkTriangleFillIcon}
				text="One or more workloads are having issues"
				size="medium"
			/>
		{:else}
			<IconWithText icon={QuestionmarkIcon} text="Team status is unknown" size="medium" />
		{/if}
	</div>
{/if}

<style>
	.nais {
		padding-top: 1rem;
	}
</style>
