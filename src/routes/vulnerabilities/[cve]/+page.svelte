<script lang="ts">
	import { page } from '$app/state';
	import V0sCveDetails from '#lib/domain/vulnerability/V0sCveDetails.svelte';
	import V0sCveNavigation from '#lib/domain/vulnerability/V0sCveNavigation.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import LegacyCvePage from './LegacyCvePage.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const store = $derived(data.v0s ? data.GlobalV0sCve : undefined);
</script>

{#if data.v0s}
	<GraphErrors errors={$store?.errors} />
	{#if $store?.data && !$store.errors?.length}
		{#key page.url.href}
			<V0sCveDetails
				advisory={$store.data.vulnerability}
				findings={$store.data.vulnerabilityFindings}
				identifier={data.identifier}
			/>
		{/key}
	{:else}
		<V0sCveNavigation />
	{/if}
{:else}
	<LegacyCvePage {data} />
{/if}
