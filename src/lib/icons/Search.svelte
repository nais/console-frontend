<script lang="ts">
	interface Props {
		height?: string;
		width?: string;
		[key: string]: unknown;
	}

	let { height = '1em', width = '1em', ...rest }: Props = $props();
</script>

<svg
	{...rest}
	{width}
	{height}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	focusable="false"
	role="img"
	><path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="M4.75 10.5a5.75 5.75 0 1 1 11.5 0 5.75 5.75 0 0 1-11.5 0Zm5.75-7.25a7.25 7.25 0 1 0 4.569 12.88l5.411 5.41a.75.75 0 1 0 1.06-1.06l-5.41-5.411A7.25 7.25 0 0 0 10.5 3.25Z"
		fill="currentColor"
	/></svg
>
