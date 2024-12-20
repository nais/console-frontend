<script lang="ts">
	interface Props {
		content: string;
		allowFreeText?: boolean;
	}

	let { content, allowFreeText }: Props = $props();
</script>

<span class:warn={!allowFreeText}>{content}</span>

<style>
	.warn {
		color: red;
	}
</style>
