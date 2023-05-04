<script lang="ts">
	import { fragment, graphql } from '$houdini';
	import type { AutoScaling } from '$houdini';

	export let app: AutoScaling;
	$: data = fragment(
		app,
		graphql(`
			fragment AutoScaling on App {
				autoScaling {
					disableAutoScaling
					cpuThresholdPercentage
					max
					min
				}
			}
		`)
	);

	$: autoscaling = $data.autoScaling;
</script>

<div style="display: flex; align-items: center; flex-direction: row; gap: 1rem;">
	<ul>
		<li>Min: {autoscaling.min}</li>
		<li>Max: {autoscaling.max}</li>
		<li>CPU Threshold: {autoscaling.cpuThresholdPercentage}%</li>
		<li>Auto Scaling: {autoscaling.disableAutoScaling ? 'true' : 'false'}</li>
	</ul>
</div>

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem 0;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-direction: row;
	}
</style>
