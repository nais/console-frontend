<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/Card.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import Deploys from '$lib/components/TeamDeployments.svelte';
	import TeamInfo from '$lib/components/TeamInfo.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';
	import { Alert } from '@nais/ds-svelte-community';

	import IconWithText from '$lib/components/IconWithText.svelte';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { TeamOverview, teamSlug } = $derived(data);
</script>

{#if page.url.searchParams.has('deleted')}
	{@const msgParts = (page.url.searchParams.get('deleted') || '').split('/')}
	<Alert variant="success" size="small">
		Successfully deleted {msgParts[0]}
		{msgParts[1]}.
	</Alert>
{/if}
<div class="header">
	<IconWithText icon={PersonGroupIcon} text={teamSlug} size="large" />
</div>
<div class="grid">
	<Card rows={2} columns={3}>
		<TeamInfo {teamSlug} />
	</Card>

	<Card rows={2} columns={3}>
		<VulnerabilitySummary {teamSlug} />
	</Card>

	<Card rows={2} columns={3}>
		<TeamUtilizationAndOverage {teamSlug} />
	</Card>
	<Card rows={2} columns={3}>
		<AggregatedCostForTeam {teamSlug} />
	</Card>

	<Card rows={1} columns={12}>
		{#if $TeamOverview.data}
			<Deploys team={$TeamOverview.data.team} />
		{/if}
	</Card>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.grid:not(:first-child) {
		margin-top: 1rem;
	}
</style>
