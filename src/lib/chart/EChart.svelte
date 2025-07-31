<script lang="ts">
	import { registerTheme } from '$lib/chart/theme';
	import { isReducedMotion } from '$lib/reducedMotion';
	import type { DefaultLabelFormatterCallbackParams, EChartsOption, EChartsType } from 'echarts';
	import { mount } from 'svelte';
	import Legends from './Legends.svelte';

	interface Props {
		options: EChartsOption;
		style?: string;
		onclick?: (name: string) => void;
	}

	let { options, style = '', onclick }: Props = $props();

	let activeSeries: string | undefined = undefined;

	const chart = (el: HTMLDivElement, options: EChartsOption) => {
		const formatter = (t: DefaultLabelFormatterCallbackParams[]) => {
			const el = document.createElement('div');
			mount(Legends, {
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

		const defaultOptions: EChartsOption = {
			animation: !isReducedMotion,
			animationDuration: 500,
			tooltip: {
				formatter: (params) => {
					if (Array.isArray(params)) {
						return formatter(params);
					}
					return formatter([params]);
				}
			}
		};

		let ins: EChartsType | undefined;

		options = { ...defaultOptions, ...options };
		options.tooltip = { ...defaultOptions.tooltip, ...options.tooltip };

		const resize = () => {
			ins?.resize();
		};

		import('echarts').then((echarts) => {
			registerTheme(echarts);
			ins = echarts.init(el, 'aksel', { renderer: 'svg' });
			ins.setOption(options);
			ins.on('mouseover', (e) => {
				activeSeries = e.seriesId;
			});
			ins.on('mouseout', () => {
				activeSeries = undefined;
			});
			window.addEventListener('resize', resize);
			ins.on('click', (e) => {
				onclick?.(e.name);
			});
		});

		window.addEventListener('resize', resize);

		return {
			update(newOptions: EChartsOption) {
				ins?.setOption({ ...options, ...newOptions });
			},
			destroy() {
				ins?.dispose();
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
