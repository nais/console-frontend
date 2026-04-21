<script lang="ts">
	import { WorkloadDeployFragment } from '$lib/domain/workload/workloadDeploy';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { useFragment, type FragmentType } from '$lib/urql/fragment';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		workload: FragmentType<typeof WorkloadDeployFragment>;
	}

	let { workload }: Props = $props();

	const data = $derived(useFragment(WorkloadDeployFragment, workload));

	let deploymentInfo = $derived(
		data.deployments.nodes.length > 0 ? data.deployments.nodes[0] : null
	);
</script>

<div class="wrapper">
	{#if deploymentInfo}
		{#if deploymentInfo.createdAt}
			<IconLabel icon={RocketIcon} size="medium">
				{#snippet label()}
					Last deployed <Time time={deploymentInfo.createdAt} distance={true} />
					{#if deploymentInfo.repository}
						from
						<ExternalLink href="https://github.com/{deploymentInfo.repository}">
							{deploymentInfo.repository}
						</ExternalLink>
					{/if}
				{/snippet}
			</IconLabel>
		{/if}
	{:else}
		<BodyShort>No deployment metadata found for workload.</BodyShort>
	{/if}
	<div style="display: flex; gap: var(--ax-space-8);">
		{#if deploymentInfo?.statuses && deploymentInfo.statuses.nodes && deploymentInfo.statuses.nodes.length > 0}
			{#if deploymentInfo?.statuses.nodes[0].state === 'FAILURE'}
				<Tag variant="error" size="small">Failed</Tag>
			{/if}
		{/if}
	</div>
</div>

<style>
	.wrapper {
		margin-top: -2rem;
		display: flex;
		gap: var(--ax-space-12);
		align-items: center;
	}
</style>
