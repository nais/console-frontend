<script lang="ts">
	import type { DefaultLabelFormatterCallbackParams } from 'echarts';

	interface Props {
		params: DefaultLabelFormatterCallbackParams;
		activeSeries: string | undefined;
		valueFormatter: ((a: unknown) => string) | undefined;
	}

	let { params, activeSeries, valueFormatter }: Props = $props();
</script>

<div style="margin: 10px 0 0;line-height:1;" class:active={activeSeries == params.seriesId}>
	<div style="margin: 0px 0 0;line-height:1;">
		<div style="margin: 0px 0 0;line-height:1;">
			<span class="marker" style="background-color:{params.color}"></span>
			<span style="font-size:14px;margin-left:2px">
				{params.seriesName}
			</span><span style="float:right;margin-left:20px;font-size:14px;font-weight:900">
				{#if valueFormatter}
					{valueFormatter(params.value)}
				{:else}
					{params.value}
				{/if}
			</span>
			<div style="clear:both"></div>
		</div>
		<div style="clear:both"></div>
	</div>
</div>

<style>
	.active {
		font-weight: bold;
	}

	.marker {
		display: inline-block;
		margin-right: 4px;
		border-radius: 10px;
		width: 10px;
		height: 10px;
	}

	.active .marker {
		border-radius: 0;
		transform: rotate(45deg);
	}
</style>
