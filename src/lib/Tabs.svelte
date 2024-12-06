<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="tabs">{@render children?.()}</div>

<style>
	.tabs {
		display: flex;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--a-border-divider);
		line-height: 1.5rem;
	}
</style>
