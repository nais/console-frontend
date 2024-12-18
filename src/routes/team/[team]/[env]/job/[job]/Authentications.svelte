<script lang="ts">
	import { fragment, graphql, type JobAuthIntegrations } from '$houdini';

	interface Props {
		job: JobAuthIntegrations;
	}

	let { job }: Props = $props();
	let data = $derived(
		fragment(
			job,
			graphql(`
				fragment JobAuthIntegrations on Job {
					authIntegrations {
						__typename
						... on EntraIDAuthIntegration {
							name
						}
						... on MaskinportenAuthIntegration {
							name
						}
					}
				}
			`)
		)
	);

	let authz = $derived($data.authIntegrations);
</script>

<div>
	<ul>
		{#each authz as a}
			<li>{a.name}</li>
		{:else}
			<p>No authz</p>
		{/each}
	</ul>
</div>
