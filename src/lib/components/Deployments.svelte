<script lang="ts">
	import { fragment, graphql, type WorkloadDeployments } from '$houdini';
	import { docURL } from '$lib/doc';
	import { BodyLong } from '@nais/ds-svelte-community';
	import DeploymentListItem from './list/DeploymentListItem.svelte';
	import List from './list/List.svelte';

	interface Props {
		workload: WorkloadDeployments;
	}

	let { workload }: Props = $props();

	let data = $derived(
		fragment(
			workload,
			graphql(`
				fragment WorkloadDeployments on Workload {
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
					deployments(first: 1000) {
						pageInfo {
							totalCount
						}
						nodes {
							id
							resources {
								nodes {
									id
									kind
									name
								}
							}
							statuses {
								nodes {
									state
									message
									createdAt
								}
							}
							environmentName
							teamSlug
							triggerUrl
							createdAt
							repository
							commitSha
							deployerUsername
						}
					}
				}
			`)
		)
	);
</script>

{#if $data !== null}
	<div>
		<BodyLong spacing>
			{#if $data.deployments.pageInfo.totalCount == 0}
				<strong>No deployments found.</strong>
				<a href={docURL('/build/')}>Learn more about builds and deployments in Nais.</a>
			{:else}
				Overview of your team's deployments.
				<a href={docURL('/build/')}>Learn more about builds and deployments in Nais.</a>
			{/if}
		</BodyLong>
		<List
			title="{$data.deployments.pageInfo.totalCount} deployment{$data.deployments.pageInfo
				.totalCount !== 1
				? 's'
				: ''}"
		>
			{#each $data.deployments.nodes as deployment (deployment.id)}
				<div><DeploymentListItem {deployment} /></div>
			{/each}
		</List>
	</div>
{/if}
