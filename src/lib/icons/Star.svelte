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
		d="m12 0 3.708 7.571L24 8.785l-6 5.893L19.416 23 12 19.071 4.584 23 6 14.678 0 8.785l8.292-1.214L12 0Zm2.312 9.508L12 4.788l-2.312 4.72-5.17.757 3.742 3.674-.884 5.186L12 16.677l4.623 2.448-.883-5.186 3.74-3.675-5.168-.756Z"
		fill="currentColor"
	/></svg
>
