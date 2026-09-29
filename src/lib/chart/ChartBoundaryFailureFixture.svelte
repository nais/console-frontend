<script lang="ts">
	import ChartBoundary from './ChartBoundary.svelte';

	function failDuringRender(): never {
		throw new Error('synthetic chart render failure');
	}
</script>

<p>Content before chart</p>

<ChartBoundary>
	<p>{failDuringRender()}</p>
</ChartBoundary>

<p>Content after chart</p>
