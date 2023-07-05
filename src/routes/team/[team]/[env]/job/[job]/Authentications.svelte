<script lang="ts">
	import { fragment, graphql } from '$houdini';
	import type { JobAuthz } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import { PendingValue } from '$houdini';

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
		<Loading width="300px" />
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
