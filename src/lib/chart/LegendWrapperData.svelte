<script lang="ts" module>
	import { getContext, setContext } from 'svelte';

	export type LegendSnippetProps =
		| {
				series?: {
					series?: Array<{ key: string; label?: string; color?: string }>;
					selectedKeys?: {
						toggle?: (key: string) => void;
						isEmpty?: () => boolean;
						isSelected?: (key: string) => boolean;
					};
				};
		  }
		| undefined;

	export type LegendItem = { key: string; label: string; color: string };

	export interface SelectionApi {
		toggle: (key: string) => void;
		isEmpty: () => boolean;
		isSelected: (key: string) => boolean;
	}

	const contextKey = Symbol('legend-context');

	class Context {
		hasLegend = $state(false);
		items: LegendItem[] = $state([]);
		selection: SelectionApi | null = $state(null);
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
	interface Props {
		context?: {
			series?: {
				series?: Array<{ key: string; label?: string; color?: string }>;
				selectedKeys?: {
					toggle?: (key: string) => void;
					isEmpty?: () => boolean;
					isSelected?: (key: string) => boolean;
				};
			};
		};
	}

	let { context }: Props = $props();

	const ctx = getLegendContext();

	$effect(() => {
		ctx.hasLegend = true;
		const allSeries = context?.series?.series ?? [];
		ctx.items = allSeries
			.filter((s) => s && s.key)
			.map((s) => ({
				key: s.key,
				label: s.label ?? s.key,
				color: s.color ?? 'currentColor'
			}));

		const sk = context?.series?.selectedKeys;
		if (sk?.toggle && sk?.isEmpty && sk?.isSelected) {
			ctx.selection = sk as SelectionApi;
		} else {
			ctx.selection = null;
		}

		return () => {
			ctx.hasLegend = false;
			ctx.items = [];
			ctx.selection = null;
		};
	});
</script>
