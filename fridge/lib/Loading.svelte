<script lang="ts">
	export let width = '100%';
	export let height = '1.5rem';
</script>

<div {...$$restProps} style="min-width: {width}; min-height: {height}" />

<style>
	div {
		background: --var(--a-surface-subtle);
		background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
		background-size: 200% 100%;
		animation: 1.5s shine linear infinite;
	}
	@keyframes shine {
		to {
			background-position-x: -200%;
		}
	}
</style>
