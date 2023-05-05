<script lang="ts">
	import { fragment, graphql } from '$houdini';
	import type { Authz } from '$houdini';

	export let app: Authz;
	$: data = fragment(
		app,
		graphql(`
			fragment Authz on App {
				authz {
					... on AzureAD {
						application {
							claims {
								extra
							}
						}
						sidecar {
							enabled
						}
					}
				}
			}
		`)
	);

	$: authz = $data.authz;
</script>

<div>
	{#each authz as a}
		{#if a.__typename === 'AzureAD' && a.application}
			<a href="/">Azure</a>
		{/if}
	{:else}
		<p>No authz</p>
	{/each}
</div>
