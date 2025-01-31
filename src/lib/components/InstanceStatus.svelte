<script lang="ts">
	import type { AppInstancesStatus } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		app: AppInstancesStatus;
	}

	let { app, ...rest }: Props = $props();
	let data = $derived(
		fragment(
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
		)
	);
</script>

{#if $data.instances}
	{@const i = $data.instances}
	<div {...rest}>
		{#if i.pageInfo.totalCount === 0}
			No instances
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
		font-size: 0.875rem;
	}
</style>
