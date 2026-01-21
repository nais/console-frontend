<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '24px' }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	width={size}
	height={size}
	aria-hidden="true"
>
	<!-- Chat bubble with hexagonal/geometric Nais-inspired design -->
	<path
		fill="var(--ax-text-subtle, currentColor)"
		d="M12 2C6.48 2 2 5.58 2 10c0 2.12.89 4.06 2.36 5.56L3 20l4.44-1.77C8.84 18.72 10.38 19 12 19c5.52 0 10-3.58 10-8s-4.48-8-10-8z"
	/>
	<!-- Inner hexagon shape inspired by Nais logo -->
	<path
		fill="var(--ax-bg-default, white)"
		d="M12 6.5l-4.33 2.5v5l4.33 2.5 4.33-2.5v-5L12 6.5z"
	/>
	<!-- Smaller inner hexagon for depth -->
	<path
		fill="var(--ax-text-subtle, currentColor)"
		d="M12 8.5l-2.6 1.5v3l2.6 1.5 2.6-1.5v-3L12 8.5z"
	/>
</svg>
