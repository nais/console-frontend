<script lang="ts">
	export let fill = 'gradient'; // Use 'gradient' to enable the gradient
	export let gradientColors = ['#4CAF50', '#2196F3']; // Default gradient colors
	export let gradientDirection = { x1: '0%', y1: '0%', x2: '100%', y2: '0%' }; // Default direction (horizontal)
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	xml:space="preserve"
	viewBox="0 0 287.36 410.27"
	{...$$restProps}
>
	<defs>
		<linearGradient
			id="gradient"
			x1={gradientDirection.x1}
			y1={gradientDirection.y1}
			x2={gradientDirection.x2}
			y2={gradientDirection.y2}
		>
			<stop offset="0%" stop-color={gradientColors[0]} />
			<stop offset="100%" stop-color={gradientColors[1]} />
		</linearGradient>
	</defs>
	<path
		fill={fill === 'gradient' ? 'url(#gradient)' : fill}
		d="M32.775 190.975c-.9 1.7-3.4.8-3.1-1.1l39.7-180.5c.5-2.4 3.6-3.3 5.2-1.3l31.6 37.5c1.4 1.7 1.7 4 .7 6zM4.775 230.575c-.6 2.8-4.7 2.3-4.7-.5v-168c0-2.2 2.6-3.3 4.2-1.9l28.2 25.3c1.3 1.2 1.9 3 1.6 4.8zM280.075 289.975h-57.1c-2.6 0-5 1.4-6.3 3.6l-30.4 48.9c-1.3 2.2-3.7 3.6-6.3 3.6h-65.9c-2.6 0-5-1.4-6.3-3.6l-32.9-57c-1.3-2.2-1.3-5 0-7.3l32.9-57c1.3-2.2 3.7-3.6 6.3-3.6h65.9c2.6 0 5 1.4 6.3 3.6l30.2 47c1.3 2.2 3.7 3.6 6.3 3.6h57.1c5.6 0 9.1-6 6.3-10.9l-63-103.7c-1.3-2.2-3.7-3.6-6.3-3.6l-69.7.3 52.7-90.6c1.3-2.2 1.3-5 0-7.3l-31-53.8c-1.7-2.9-5.9-2.9-7.5 0l-160.4 276.1c-1.3 2.2-1.3 5 0 7.3l69.9 121.1c1.3 2.2 3.7 3.6 6.3 3.6h139.8c2.6 0 5-1.4 6.3-3.6l63.1-105.8c2.8-4.9-.7-10.9-6.3-10.9z"
	/>
</svg>
