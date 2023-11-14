<script lang="ts">
	import type {
		DefaultLabelFormatterCallbackParams,
		ECElementEvent,
		EChartsOption,
		EChartsType
	} from 'echarts';
	import { createEventDispatcher } from 'svelte';
	import Legends from './Legends.svelte';

	export let options: EChartsOption;
	export let theme = 'london';
	export let style = '';

	const dispatcher = createEventDispatcher<{ click: ECElementEvent }>();

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

		let ins: EChartsType | undefined;

		options = { ...defaultOptions, ...options };
		options.tooltip = { ...options.tooltip, ...defaultOptions.tooltip };

		const resize = () => {
			ins?.resize();
		};

		import('echarts').then((echarts) => {
			ins = echarts.init(el, theme, { renderer: 'svg' });
			ins.setOption(options);
			ins.on('mouseover', (e) => {
				activeSeries = e.seriesId;
			});
			ins.on('mouseout', () => {
				activeSeries = undefined;
			});
			window.addEventListener('resize', resize);
			ins.on('click', (e) => {
				dispatcher('click', e);
			});
		});

		window.addEventListener('resize', resize);

		return {
			update(newOptions: EChartsOption) {
				console.log('update:', ins);
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
