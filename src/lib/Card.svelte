<script lang="ts">
	export let paddingBottom = '';
	export let minWidth = '';
	export let width = '';
	export let height = '';
	export let columns = 0;
	export let rows = 0;
</script>

<div
	{...$$restProps}
	style="--columns: {columns}; --rows: {rows}; padding-bottom: {paddingBottom}; min-width: {minWidth}; width: {width}; height: {height};"
>
	<slot />
</div>

<style>
	div {
		border-radius: 0.5rem;
		background-color: var(--a-bg-default);
		padding: 1rem;
		grid-column: span var(--columns);
		grid-row: span var(--rows);
	}
</style>
