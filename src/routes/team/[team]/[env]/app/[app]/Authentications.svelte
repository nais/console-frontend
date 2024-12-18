<script lang="ts">
	import { fragment, graphql, type AppAuthIntegrations } from '$houdini';

	interface Props {
		app: AppAuthIntegrations;
	}

	let { app }: Props = $props();
	let data = $derived(
		fragment(
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
