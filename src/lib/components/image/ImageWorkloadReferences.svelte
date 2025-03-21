<script lang="ts">
	import { fragment, graphql, type ImageWorkloadReferences } from '$houdini';
	import WorkloadLink from '../WorkloadLink.svelte';

	interface Props {
		image: ImageWorkloadReferences;
	}

	let { image }: Props = $props();

	let workloadRefs = $derived(
		fragment(
			image,
			graphql(`
				fragment ImageWorkloadReferences on ContainerImage {
					workloadReferences {
						nodes {
							workload {
								id
								__typename
								team {
									slug
								}
								teamEnvironment {
									environment {
										name
									}
								}
								name
							}
						}
					}
				}
			`)
		)
	);
</script>

{#each $workloadRefs.workloadReferences.nodes as node (node.workload.id)}
	<WorkloadLink workload={node.workload} />
{/each}
