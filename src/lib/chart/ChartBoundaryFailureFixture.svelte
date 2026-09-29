<script lang="ts">
	import ChartBoundary from './ChartBoundary.svelte';

	function failDuringRender(): never {
		throw new Error('synthetic chart render failure');
	}
</script>

<ChartBoundary>
	<p>{failDuringRender()}</p>
</ChartBoundary>
