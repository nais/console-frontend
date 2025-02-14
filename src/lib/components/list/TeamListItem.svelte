<script lang="ts">
	import { Heading, Link } from '@nais/ds-svelte-community';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import IconWithText from '../IconWithText.svelte';
	import ListItem from './ListItem.svelte';

	const { team }: { team: { slug: string; purpose: string } } = $props();
</script>

<ListItem>
	<IconWithText size="large" icon={PersonGroupIcon} description={team.purpose}>
		{#snippet text()}
			<Heading level="4" size="xsmall">
				<Link href="#">{team.slug}</Link>
			</Heading>
		{/snippet}
	</IconWithText>
</ListItem>
