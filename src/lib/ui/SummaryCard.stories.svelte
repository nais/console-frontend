<script module>
	import { BulletListIcon, CheckmarkCircleIcon, WalletIcon } from '@nais/ds-svelte-community/icons';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CircleProgressBar from '$lib/ui/CircleProgressBar.svelte';
	import SummaryCard from '$lib/ui/SummaryCard.svelte';

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

<Story name="With CircleProgressBar" asChild>
	<div
		style="border: 1px solid var(--ax-border-neutral); background-color: var(--ax-bg-sunken); padding: var(--ax-space-20); border-radius: 12px;"
	>
		<SummaryCard
			title="CPU utilization"
			helpText="Current CPU utilization"
			color="grey"
			styled={false}
		>
			{#snippet icon()}
				<CircleProgressBar progress={0.65} />
			{/snippet}
			65.0% of 2 cores
		</SummaryCard>
	</div>
</Story>

<Story name="Multiple with progress bars" asChild>
	<div
		style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;"
	>
		<div
			style="border: 1px solid var(--ax-border-neutral); background-color: var(--ax-bg-sunken); padding: var(--ax-space-20); border-radius: 12px;"
		>
			<SummaryCard
				title="CPU utilization"
				helpText="Current CPU utilization"
				color="grey"
				styled={false}
			>
				{#snippet icon()}
					<CircleProgressBar progress={0.097} />
				{/snippet}
				9.7% of 1 core
			</SummaryCard>
		</div>

		<div
			style="border: 1px solid var(--ax-border-neutral); background-color: var(--ax-bg-sunken); padding: var(--ax-space-20); border-radius: 12px;"
		>
			<SummaryCard
				title="Memory utilization"
				helpText="Current memory utilization"
				color="grey"
				styled={false}
			>
				{#snippet icon()}
					<CircleProgressBar progress={0.6} />
				{/snippet}
				60.0% of 3.85 GB
			</SummaryCard>
		</div>

		<div
			style="border: 1px solid var(--ax-border-neutral); background-color: var(--ax-bg-sunken); padding: var(--ax-space-20); border-radius: 12px;"
		>
			<SummaryCard
				title="Disk utilization"
				helpText="Current disk utilization"
				color="grey"
				styled={false}
			>
				{#snippet icon()}
					<CircleProgressBar progress={0.147} />
				{/snippet}
				14.7% of 15.7 GB
			</SummaryCard>
		</div>
	</div>
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
