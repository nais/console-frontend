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
		color: var(--ax-text-subtle);
		padding: 0.75rem 1rem;
		border-bottom: 3px solid transparent;
	}
	.tab.active {
		color: var(--ax-text-neutral);
		border-bottom: 3px solid var(--ax-border-accent-strong);
	}
</style>
