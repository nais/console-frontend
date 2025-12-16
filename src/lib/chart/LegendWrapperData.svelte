<script lang="ts" module>
	import type { Legend } from 'layerchart';
	import { getContext, setContext, type ComponentProps } from 'svelte';

	export type LegendSnippetProps = {
		getLegendProps: () => ComponentProps<typeof Legend>;
	};

	const contextKey = Symbol('legend-context');

	class Context {
		data: LegendSnippetProps | undefined = $state();
	}

	function getLegendContext() {
		return getContext<Context>(contextKey);
	}

	export function createLegendContext() {
		const value = new Context();
		setContext(contextKey, value);
		return value;
	}
</script>

<script lang="ts">
	let {
		data
	}: {
		data: LegendSnippetProps;
	} = $props();

	const ctx = getLegendContext();

	$effect(() => {
		ctx.data = data;
	});
</script>
