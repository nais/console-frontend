<script lang="ts">
	import type { JobAuthz } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import { Skeleton } from '@nais/ds-svelte-community';

	export let job: JobAuthz;
	$: data = fragment(
		job,
		graphql(`
			fragment JobAuthz on NaisJob @loading(cascade: true) {
				authz {
					... on AzureAD {
						application {
							tenant
						}
						sidecar {
							autoLogin
						}
					}
					... on Maskinporten {
						scopes {
							consumes {
								name
							}
						}
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
		<Skeleton variant="rectangle" width="300px" />
	{/if}
	{#each authz as a}
		{#if a.__typename === 'AzureAD'}
			Azure
		{/if}
		{#if a.__typename === 'Maskinporten'}
			Maskinporten
		{/if}
	{:else}
		<p>No authz</p>
	{/each}
</div>
