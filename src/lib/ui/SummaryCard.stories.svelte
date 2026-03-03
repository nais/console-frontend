<script module>
	import SummaryCard from '$lib/ui/SummaryCard.svelte';
	import { BulletListIcon, CheckmarkCircleIcon, WalletIcon } from '@nais/ds-svelte-community/icons';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Lib/components/SummaryCard',
		component: SummaryCard,
		tags: ['autodocs']
	});
</script>

<Story name="With icon" asChild>
	<SummaryCard
		title="Toggles"
		color="grey"
		helpText="Number of feature toggles in the Unleash server"
	>
		{#snippet icon({ color })}
			<BulletListIcon font-size="32" {color} />
		{/snippet}
		42
	</SummaryCard>
</Story>

<Story name="With styled border" asChild>
	<SummaryCard title="Healthy workloads" color="green">
		{#snippet icon({ color })}
			<CheckmarkCircleIcon font-size="32" {color} />
		{/snippet}
		42 of 45
	</SummaryCard>
</Story>

<Story name="Cost card" asChild>
	<SummaryCard title="Monthly cost" color="blue">
		{#snippet icon({ color })}
			<WalletIcon font-size="32" {color} />
		{/snippet}
		49,42 €
	</SummaryCard>
</Story>
