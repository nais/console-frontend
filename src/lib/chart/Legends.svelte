<script lang="ts">
	import { format } from 'date-fns';
	import type { DefaultLabelFormatterCallbackParams } from 'echarts';
	import Legend from './Legend.svelte';

	interface Props {
		params: DefaultLabelFormatterCallbackParams[];
		activeSeries: string | undefined;
		valueFormatter: ((a: unknown) => string) | undefined;
	}

	let { params, activeSeries, valueFormatter }: Props = $props();
</script>

<div style="margin: 0px 0 0;line-height:1;">
	<div style="font-size:14px;color:#666;font-weight:400;line-height:1;">
		{Array.isArray(params[0].data) ? format(params[0].data[0]!, 'dd/MM/yyyy') : params[0].name}
	</div>

	{#each params as param (param)}
		<Legend params={param} {activeSeries} {valueFormatter} />
	{/each}
</div>
