<script module>
	import { BodyShort } from '@nais/ds-svelte-community';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CircleProgressBar from './CircleProgressBar.svelte';

	const { Story } = defineMeta({
		title: 'Lib/components/CircleProgressBar',
		component: CircleProgressBar,
		tags: ['autodocs']
	});
</script>

<Story name="Low usage (25%)" asChild>
	<CircleProgressBar progress={0.25}>
		<BodyShort style="font-weight: bold;">25%</BodyShort>
	</CircleProgressBar>
</Story>

<Story name="Medium usage (50%)" asChild>
	<CircleProgressBar progress={0.5}>
		<BodyShort style="font-weight: bold;">50%</BodyShort>
	</CircleProgressBar>
</Story>

<Story name="High usage (75%)" asChild>
	<CircleProgressBar progress={0.75}>
		<BodyShort style="font-weight: bold;">75%</BodyShort>
	</CircleProgressBar>
</Story>

<Story name="Critical usage (90%)" asChild>
	<CircleProgressBar progress={0.9}>
		<BodyShort style="font-weight: bold;">90%</BodyShort>
	</CircleProgressBar>
</Story>

<Story name="Full (100%)" asChild>
	<CircleProgressBar progress={1}>
		<BodyShort style="font-weight: bold;">100%</BodyShort>
	</CircleProgressBar>
</Story>

<Story name="Large size" asChild>
	<CircleProgressBar progress={0.65} size="100px">
		<BodyShort style="font-weight: bold; font-size: 1.5rem;">65%</BodyShort>
	</CircleProgressBar>
</Story>

<Story name="Custom colors" asChild>
	<CircleProgressBar progress={0.4} startColor="blue" endColor="purple">
		<BodyShort style="font-weight: bold;">40%</BodyShort>
	</CircleProgressBar>
</Story>

<Story name="Multiple comparison" asChild>
	<div style="display: flex; gap: 2rem; align-items: center;">
		<div style="text-align: center;">
			<CircleProgressBar progress={0.25}>
				<BodyShort style="font-weight: bold;">25%</BodyShort>
			</CircleProgressBar>
			<BodyShort style="margin-top: 0.5rem;">CPU</BodyShort>
		</div>
		<div style="text-align: center;">
			<CircleProgressBar progress={0.5}>
				<BodyShort style="font-weight: bold;">50%</BodyShort>
			</CircleProgressBar>
			<BodyShort style="margin-top: 0.5rem;">Memory</BodyShort>
		</div>
		<div style="text-align: center;">
			<CircleProgressBar progress={0.85}>
				<BodyShort style="font-weight: bold;">85%</BodyShort>
			</CircleProgressBar>
			<BodyShort style="margin-top: 0.5rem;">Storage</BodyShort>
		</div>
	</div>
</Story>
