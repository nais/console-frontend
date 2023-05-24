<script lang="ts">
	export let paddingBottom = '';
	export let width = '';
	export let height = '';
</script>

<div
	{...$$restProps}
	style="padding-bottom: {paddingBottom}; min-width: {width}; max-height: {height} "
>
	<slot />
</div>

<style>
	div {
		border-radius: 0.25rem;
		background-color: var(--a-bg-default);
		padding: 1.5rem;
		overflow: scroll;
	}
</style>
