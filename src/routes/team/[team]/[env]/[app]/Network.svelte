<script>
	import Arrow from '$lib/icons/Arrow.svelte';
</script>

<div>
	<Arrow style="transform: rotate(135deg);" size="1.2rem" /> 33.0 kB/s
</div>
<div>
	<Arrow style="transform: rotate(-45deg);" size="1.2rem" /> 57.5 kB/s
</div>

<style>
	div {
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 1rem;
	}
</style>
