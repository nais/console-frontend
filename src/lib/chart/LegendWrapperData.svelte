<script lang="ts" module>
	import { getContext, setContext } from 'svelte';

	export type LegendSnippetProps = {
		context: unknown;
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
