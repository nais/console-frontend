<script lang="ts">
	import type { DefaultLabelFormatterCallbackParams, EChartsOption } from 'echarts';
	import * as echarts from 'echarts';
	import Legends from './Legends.svelte';

	export let options: EChartsOption;
	export let theme = 'london';
	export let style = '';

	let activeSeries: string | undefined = undefined;

	const chart = (el: HTMLDivElement, options: EChartsOption) => {
		const formatter = (t: DefaultLabelFormatterCallbackParams[]) => {
			const el = document.createElement('div');
			new Legends({
				props: {
					params: t,
					activeSeries: activeSeries,
					valueFormatter: Array.isArray(options.tooltip)
						? undefined
						: (options.tooltip?.valueFormatter as never)
				},
				target: el
			});
			return el;
		};

		const defaultOptions = {
			tooltip: {
				formatter: (params) => {
					if (Array.isArray(params)) {
						return formatter(params);
					}
					return formatter([params]);
				}
			}
		} as EChartsOption;

		const ins = echarts.init(el, theme, { renderer: 'svg' });
		options = { ...defaultOptions, ...options };
		options.tooltip = { ...options.tooltip, ...defaultOptions.tooltip };
		ins.setOption(options);
		ins.on('mouseover', (e) => {
			activeSeries = e.seriesId;
		});
		ins.on('mouseout', () => {
			activeSeries = undefined;
		});

		const resize = () => {
			ins.resize();
		};
		window.addEventListener('resize', resize);

		return {
			update(newOptions: EChartsOption) {
				ins.setOption({ ...options, ...newOptions });
			},
			destroy() {
				ins.dispose();
				window.removeEventListener('resize', resize);
			}
		};
	};
</script>

<div use:chart={options} {style}></div>

<style>
	div {
		min-height: 300px;
		width: 100%;
	}
</style>
