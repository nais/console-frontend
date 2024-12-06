<script lang="ts">
	interface Props {
		size?: string;
		[key: string]: unknown;
	}

	let { size = '1em', ...rest }: Props = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" {...rest} width={size} height={size} viewBox="0 0 24 24"
	><g data-name="Product Icons">
		<rect fill="#fff" stroke="#000" x="2" y="4" width="20" height="7" />
		<rect fill="#000" x="20" y="4" width="2" height="7" />
		<rect fill="#000" x="2" y="4" width="2" height="7" />
		<rect x="6" y="7" width="6" height="1" />
		<rect x="15" y="6" width="3" height="3" rx="1.5" />

		<rect fill="#fff" stroke="#000" x="2" y="13" width="20" height="7" />
		<rect fill="#000" x="20" y="13" width="2" height="7" />
		<rect fill="#000" x="2" y="13" width="2" height="7" />
		<rect x="6" y="16" width="6" height="1" />
		<rect x="15" y="15" width="3" height="3" rx="1.5" /></g
	></svg
>
