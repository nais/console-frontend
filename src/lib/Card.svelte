<script lang="ts">
	export let paddingBottom = '';
	export let minWidth = '';
	export let width = '';
	export let height = '';
	export let columns = 0;
</script>

<div
	{...$$restProps}
	style="--columns: {columns}; padding-bottom: {paddingBottom}; min-width: {minWidth}; width: {width}; height: {height};"
>
	<slot />
</div>

<style>
	div {
		border-radius: 0.25rem;
		background-color: var(--a-bg-default);
		padding: 1.5rem;
		grid-column: span var(--columns);
	}
</style>
