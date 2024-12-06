<script lang="ts">
	interface Props {
		width?: string;
		[key: string]: unknown;
	}

	let { width = '1em', ...rest }: Props = $props();
</script>

<svg
	{width}
	height="1em"
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	focusable="false"
	role="img"
	{...rest}
	><path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="m12 6.586 7.707 7.707-1.414 1.414L12 9.414l-6.293 6.293-1.414-1.414L12 6.586Z"
		fill="currentColor"
	/></svg
>
