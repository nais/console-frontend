<script lang="ts">
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from '../IconLabel.svelte';
	import Badge, { type BadgeProps } from './Badge.svelte';
	import ListItem from './ListItem.svelte';

	const {
		team,
		badge
	}: {
		team: { slug: string; purpose: string };
		badge?: BadgeProps;
	} = $props();
</script>

<ListItem>
	<IconLabel
		label={team.slug}
		icon={PersonGroupIcon}
		description={team.purpose}
		size="large"
		level="3"
		href="/team/{team.slug}"
	/>
	{#if badge}
		<Badge {...badge} />
	{/if}
</ListItem>
