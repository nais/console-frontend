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
		color: var(--ax-text-subtle, --a-text-subtle);
		padding: 0.75rem 1rem;
		border-bottom: 3px solid transparent;
	}
	.tab:hover {
		/* TODO(thokra): What should this be? */
		border-bottom: 3px solid var(--ax-border-subtle, --a-border-subtle-hover);
	}
	.tab.active {
		color: var(--ax-text-neutral, --a-text-default);
		border-bottom: 3px solid var(--ax-border-accent-strong, --a-border-action);
	}
</style>
