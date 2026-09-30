<script lang="ts">
	import ChartBoundary from './ChartBoundary.svelte';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';

	function failDuringRender(): never {
		throw new Error('synthetic chart render failure');
	}
</script>

<p>Content before chart</p>

<ChartBoundary>
	<p>{failDuringRender()}</p>
</ChartBoundary>

<SectionBoundary message="Metadata failed to render.">
	<p>{failDuringRender()}</p>
</SectionBoundary>

<p>Content after chart</p>
