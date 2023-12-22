<script lang="ts">
	export let paddingBottom = '';
	export let minWidth = '';
	export let width = '';
	export let height = '';
	export let columns = 0;
	export let rows = 0;
	export let borderColor = 'var(--a-gray-200)';
	export let style = '';
</script>

<div
	{...$$restProps}
	style="{style}; --columns: {columns}; --rows: {rows}; padding-bottom: {paddingBottom}; min-width: {minWidth}; width: {width}; height: {height}; --borderColor: {borderColor};"
>
	<slot />
</div>

<style>
	div {
		border-radius: 0.5rem;
		border: 1px solid var(--borderColor);
		background-color: var(--a-bg-default);
		padding: 1rem;
		grid-column: span var(--columns);
		grid-row: span var(--rows);
	}
</style>
