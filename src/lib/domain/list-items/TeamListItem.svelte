<script lang="ts">
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';

	const {
		team
		// badge
	}: {
		team: { slug: string; purpose: string };
		// badge?: BadgeProps;
	} = $props();
</script>

<ListItem href="/team/{team.slug}">
	<IconLabel
		label={team.slug}
		icon={PersonGroupIcon}
		description={team.purpose}
		size="large"
		level="3"
	/>
	<!-- {#if badge}
		<Badge {...badge} />
	{/if} -->
</ListItem>
