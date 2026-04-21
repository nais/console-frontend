<script lang="ts" module>
	import { getContext, setContext } from 'svelte';

	export type LegendSnippetProps = unknown;

	const contextKey = Symbol('legend-context');

	class Context {
		hasLegend = $state(false);
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
	const ctx = getLegendContext();

	$effect(() => {
		ctx.hasLegend = true;

		return () => {
			ctx.hasLegend = false;
		};
	});
</script>
