<script lang="ts">
	import type { EChartsOption } from 'echarts';
	import * as echarts from 'echarts';

	export let options: EChartsOption;
	export let theme = 'london';
	export let style = '';

	const chart = (el: HTMLDivElement, options: EChartsOption) => {
		const ins = echarts.init(el, theme, { renderer: 'svg' });
		ins.setOption(options);

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
