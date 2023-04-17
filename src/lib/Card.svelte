<script lang="ts">
	let columns = '';
	export { columns };
</script>

<div style="--columns: {columns}"><slot /></div>

<style>
	div {
		border-radius: 0.25rem;
		background-color: var(--a-bg-default);
		padding: 0 1.5rem;
		display: block;
		grid-column: span var(--columns);
	}
</style>
