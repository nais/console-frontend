<script lang="ts">
	interface Props {
		repository: string;
	}

	let { repository }: Props = $props();
</script>

<a href="https://github.com/{repository}" target="_blank">{repository}</a>
