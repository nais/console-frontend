<script lang="ts">
	export let columns = 0;
	export let paddingBottom = '';
</script>

<div {...$$restProps} style="--columns: {columns}; padding-bottom: {paddingBottom} "><slot /></div>

<style>
	div {
		border-radius: 0.25rem;
		background-color: var(--a-bg-default);
		padding: 1.5rem;
		display: block;
		grid-column: span var(--columns);
	}
</style>
