<script lang="ts">
	interface Props {
		size?: string;
		[key: string]: unknown;
	}

	let { size = '1em', ...rest }: Props = $props();
</script>

<svg
	{...rest}
	width={size}
	height={size}
	viewBox="0 0 18 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<path
		d="M2 23H16C16.5523 23 17 22.5523 17 22V5.06637L11.0892 1H2C1.44771 1 1 1.44771 1 2V22C1 22.5523 1.44771 23 2 23Z"
		stroke-width="2"
		stroke="currentColor"
	/>
</svg>
