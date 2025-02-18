<script lang="ts">
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from '../IconLabel.svelte';
	import ListItem from './ListItem.svelte';

	const { team }: { team: { slug: string; purpose: string } } = $props();
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
</ListItem>
