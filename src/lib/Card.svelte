<script lang="ts">
	interface Props {
		paddingBottom?: string;
		minWidth?: string;
		width?: string;
		height?: string;
		columns?: number;
		rows?: number;
		borderColor?: string;
		style?: string;
		children?: import('svelte').Snippet;
		[key: string]: unknown;
	}

	let {
		paddingBottom = '',
		minWidth = '',
		width = '',
		height = '',
		columns = 0,
		rows = 0,
		borderColor = 'var(--active-color-strong)',
		style = '',
		children,
		...rest
	}: Props = $props();
</script>

<div
	{...rest}
	style="{style}; --columns: {columns}; --rows: {rows}; padding-bottom: {paddingBottom}; min-width: {minWidth}; width: {width}; height: {height}; --borderColor: {borderColor};"
>
	{@render children?.()}
</div>

<style>
	div {
		border-radius: 0.5rem;
		border: 1px solid var(--borderColor);
		background-color: var(--ax-bg-default, --a-bg-default);
		padding: 1rem;
		grid-column: span var(--columns);
		grid-row: span var(--rows);
	}
</style>
