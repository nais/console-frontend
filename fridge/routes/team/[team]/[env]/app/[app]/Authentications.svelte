<script lang="ts">
	import type { Authz } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import { Skeleton } from '@nais/ds-svelte-community';

	export let app: Authz;
	$: data = fragment(
		app,
		graphql(`
			fragment Authz on App @loading(cascade: true) {
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
	$: loading = $data.authz.map((d) => d.__typename).includes(PendingValue);

	$: authz = $data.authz;
</script>

<div>
	{#if loading}
		<Skeleton variant="text" width="300px" />
	{/if}
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
