<script lang="ts">
	interface Props {
		height?: string;
		[key: string]: unknown;
	}

	let { height = '1em', ...rest }: Props = $props();
</script>

<svg
	{...rest}
	width="1em"
	{height}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	focusable="false"
	role="img"
	><path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="m12 0 10 10v14h-9v-6h-2v6H2V10L12 0Zm0 2.829-8 7.999V22h5v-6h6v6h5V10.829l-8-8Z"
		fill="currentColor"
	/></svg
>
