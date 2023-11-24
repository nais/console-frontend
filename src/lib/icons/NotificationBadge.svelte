<script lang="ts">
	export let color = '#ff0000';
	export let size = '32px';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	xml:space="preserve"
	style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
	viewBox="0 0 32 32"
	width={size}
	height={size}
	{...$$restProps}
>
	<g>
		<circle
			style="fill:{color};fill-opacity:100%;stroke:{color};stroke-width:2;stroke-miterlimit:10;"
			cx="50%"
			cy="50%"
			r="45%"
		>
		</circle>
	</g>
</svg>

<style>
</style>
