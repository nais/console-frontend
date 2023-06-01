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
							tenant
						}
						sidecar {
							autoLogin
						}
					}
					... on IDPorten {
						integrationType
					}
					... on Maskinporten {
						scopes {
							consumes {
								name
							}
						}
					}
					... on TokenX {
						mountSecretsAsFilesOnly
					}
				}
			}
		`)
	);

	$: authz = $data.authz;
</script>

<div>
	{#each authz as a}
		{#if a.__typename === 'AzureAD'}
			Azure
		{/if}
		{#if a.__typename === 'IDPorten'}
			IDPorten
		{/if}
		{#if a.__typename === 'Maskinporten'}
			Maskinporten
		{/if}
		{#if a.__typename === 'TokenX'}
			TokenX
		{/if}
	{:else}
		<p>No authz</p>
	{/each}
</div>
