<script lang="ts">
	import { fragment, graphql, type WorkloadDeploy } from '$houdini';
	import Time from '$lib/Time.svelte';

	import { Heading } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		workload: WorkloadDeploy;
	}

	let { workload }: Props = $props();

	let data = $derived(
		fragment(
			workload,
			graphql(`
				fragment WorkloadDeploy on Workload {
					__typename
					name
					deployments(first: 1) {
						nodes {
							deployerUsername
							createdAt
							triggerUrl
							commitSha
							repository
						}
					}
				}
			`)
		)
	);

	let deploymentInfo = $derived(
		$data.deployments.nodes.length > 0 ? $data.deployments.nodes[0] : null
	);

	function isValidSha(sha: string): boolean {
		return /^[0-9a-f]{40}$/i.test(sha);
	}
</script>

<div>
	<Heading level="3" size="small" spacing>Deploy</Heading>
</div>
{#if deploymentInfo}
	{#if deploymentInfo.createdAt}
		Last deployed <Time time={deploymentInfo.createdAt} distance={true} />.
	{/if}

	{#if deploymentInfo.triggerUrl}
		<div><a href={deploymentInfo.triggerUrl}>Github action <ExternalLinkIcon /></a></div>
	{/if}

	{#if deploymentInfo?.commitSha && isValidSha(deploymentInfo?.commitSha)}
		<div>
			<a href="https://github.com/{deploymentInfo?.repository}/commit/{deploymentInfo?.commitSha}"
				>Commit {deploymentInfo?.commitSha.slice(0, 7)} <ExternalLinkIcon /></a
			>
		</div>
	{/if}
{:else}
	No deployments
{/if}
