<script lang="ts">
	import { fragment, graphql, type AppAuthIntegrations } from '$houdini';

	export let app: AppAuthIntegrations;
	$: data = fragment(
		app,
		graphql(`
			fragment AppAuthIntegrations on Application {
				authIntegrations {
					__typename
					... on EntraIDAuthIntegration {
						name
					}
					... on IDPortenAuthIntegration {
						name
					}
					... on MaskinportenAuthIntegration {
						name
					}
					... on TokenXAuthIntegration {
						name
					}
				}
			}
		`)
	);
	//$: loading = $data.authIntegrations.map((d) => d.__typename).includes(PendingValue);

	$: authz = $data.authIntegrations;
</script>

<div>
	<!--{#if loading}
		<Skeleton variant="text" width="300px" />
	{/if}-->
	<ul>
		{#each authz as a}
			<li>{a.name}</li>
		{:else}
			<p>No authz</p>
		{/each}
	</ul>
</div>
