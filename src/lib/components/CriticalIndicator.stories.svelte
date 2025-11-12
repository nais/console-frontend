<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CriticalIndicator from './CriticalIndicator.svelte';

	const { Story } = defineMeta({
		component: CriticalIndicator,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<CriticalIndicator />
</Story>

<Story name="In context" asChild>
	<div style="display: flex; align-items: center; gap: 0.5rem;">
		<CriticalIndicator />
		<span>Critical vulnerability detected</span>
	</div>
</Story>

<Story name="Multiple" asChild>
	<div style="display: flex; gap: 2rem;">
		<div style="display: flex; align-items: center; gap: 0.5rem;">
			<CriticalIndicator />
			<span>Issue 1</span>
		</div>
		<div style="display: flex; align-items: center; gap: 0.5rem;">
			<CriticalIndicator />
			<span>Issue 2</span>
		</div>
		<div style="display: flex; align-items: center; gap: 0.5rem;">
			<CriticalIndicator />
			<span>Issue 3</span>
		</div>
	</div>
</Story>
