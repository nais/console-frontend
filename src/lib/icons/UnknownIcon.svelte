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
		d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0Zm0 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2ZM9 19v-2h2v-5H9v-2h4v7h2v2H9Zm3-14a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
		fill="currentColor"
	/></svg
>
