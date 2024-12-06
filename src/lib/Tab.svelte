<script lang="ts">
	interface Props {
		href?: string;
		active?: boolean;
		title?: string;
	}

	let { href = '', active = false, title = '' }: Props = $props();
</script>

<a {href} class="tab" class:active>
	{title}
</a>

<style>
	.tab {
		text-decoration: none;
		color: var(--a-text-subtle);
		padding: 0.75rem 1rem;
		border-bottom: 3px solid transparent;
	}
	.tab:hover {
		border-bottom: 3px solid var(--a-border-subtle-hover);
	}
	.tab.active {
		color: var(--a-text-default);
		border-bottom: 3px solid var(--a-border-action);
	}
</style>
