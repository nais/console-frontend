<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RunningIndicator from './RunningIndicator.svelte';

	const { Story } = defineMeta({
		title: 'Lib/components/RunningIndicator',
		component: RunningIndicator,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<RunningIndicator />
</Story>

<Story name="In context" asChild>
	<div style="display: flex; align-items: center; gap: 0.5rem;">
		<RunningIndicator />
		<span>Workload is running</span>
	</div>
</Story>

<Story name="Multiple indicators" asChild>
	<div style="display: flex; gap: 2rem;">
		<div style="display: flex; align-items: center; gap: 0.5rem;">
			<RunningIndicator />
			<span>Service A</span>
		</div>
		<div style="display: flex; align-items: center; gap: 0.5rem;">
			<RunningIndicator />
			<span>Service B</span>
		</div>
		<div style="display: flex; align-items: center; gap: 0.5rem;">
			<RunningIndicator />
			<span>Service C</span>
		</div>
	</div>
</Story>
