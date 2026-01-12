<script lang="ts">
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';

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
		as="h3"
	/>
</ListItem>
