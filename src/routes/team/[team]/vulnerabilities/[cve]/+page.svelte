<script lang="ts">
	import { page } from '$app/state';
	import V0sCveDetails from '#lib/domain/vulnerability/V0sCveDetails.svelte';
	import V0sCveNavigation from '#lib/domain/vulnerability/V0sCveNavigation.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import LegacyTeamCvePage from './LegacyTeamCvePage.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const store = $derived(data.v0s ? data.TeamV0sCve : undefined);
</script>

{#if data.v0s}
	<GraphErrors errors={$store?.errors} />
	{#if $store?.data && !$store.errors?.length}
		{#key page.url.href}
			<V0sCveDetails
				advisory={$store.data.vulnerability}
				findings={$store.data.team.vulnerabilityFindings}
				identifier={data.identifier}
				team={data.teamSlug}
				viewerIsMember={$store.data.team.viewerIsMember}
			/>
		{/key}
	{:else}
		<V0sCveNavigation />
	{/if}
{:else}
	<LegacyTeamCvePage {data} />
{/if}
