<script lang="ts">
	import type { AppInstancesStatus } from '$houdini';
	import { fragment, graphql } from '$houdini';

	export let app: AppInstancesStatus;
	$: data = fragment(
		app,
		graphql(`
			fragment AppInstancesStatus on Application {
				instances {
					pageInfo {
						totalCount
					}
					edges {
						node {
							status {
								message
								state
							}
						}
					}
				}
			}
		`)
	);
</script>

{#if $data.instances}
	{@const i = $data.instances}
	<div>
		{#if i.pageInfo.totalCount === 0}
			No instances found
		{:else}
			{i.edges.filter((s) => s.node.status.state === 'RUNNING').length} / {i.pageInfo.totalCount} running
		{/if}
	</div>
{/if}

<style>
	div {
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>
