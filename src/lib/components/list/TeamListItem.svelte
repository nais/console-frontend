<script lang="ts">
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from '../IconLabel.svelte';
	import ListItem from './ListItem.svelte';

	const { team, errors }: { team: { slug: string; purpose: string }; errors: number } = $props();
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
	{#if errors}
		<div class={['errors', { 'errors--long': `${errors}`.length > 2 }]}>
			{errors}
		</div>
	{/if}
</ListItem>

<style>
	.errors {
		height: 2rem;
		width: 2rem;
		border-radius: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: var(--a-font-weight-bold);
		background-color: var(--a-surface-danger);
		color: var(--a-text-on-danger);

		&.errors--long {
			font-size: var(--a-font-size-medium);
		}
	}
</style>
