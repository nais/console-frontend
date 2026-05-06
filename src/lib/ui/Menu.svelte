<script lang="ts">
	import Icon from './Icon.svelte';

	const {
		items,
		onItemSelect
	}: {
		items: {
			label: string;
			href: string;
			active?: boolean;
		}[][];
		onItemSelect?: () => void;
	} = $props();
</script>

<div class="menu">
	{#each items as group, i (group)}
		{#if i > 0}
			<hr />
		{/if}
		<div class="list">
			{#each group as { label: text, href, active } (href)}
				<a {href} class:active onclick={onItemSelect}>
					<span class="icon-box"><Icon icon={text} /></span>
					<span class="label">{text}</span>
				</a>
			{/each}
		</div>
	{/each}
</div>

<style>
	.menu {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);

		hr {
			border: none;
			border-top: 1px solid var(--ax-border-neutral-subtleA);
			margin: 0;
		}

		.list {
			display: flex;
			flex-direction: column;
			gap: var(--ax-space-2);
		}

		a {
			display: flex;
			align-items: center;
			gap: var(--ax-space-8);
			border-radius: var(--ax-radius-8);
			padding: var(--ax-space-4) var(--ax-space-8);
			text-decoration: none;
			color: inherit;
			font-size: var(--ax-font-size-medium);
			transition: background-color 50ms;

			&:focus-visible,
			&:hover {
				background-color: color-mix(in oklab, var(--active-color) 60%, transparent);
				box-shadow: none;
				color: inherit;
			}

			&:active {
				background-color: var(--active-color-strong);
				box-shadow: none;
				color: inherit;
			}

			&.active {
				background-color: var(--active-color);
			}
		}

		.icon-box {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 24px;
			height: 24px;
			flex-shrink: 0;
			border-radius: var(--ax-radius-4);
			font-size: 1rem;
			color: var(--ax-text-subtle);
			background: color-mix(in srgb, var(--ax-text-subtle) 10%, transparent);
		}

		.active .icon-box {
			color: var(--surface-accent-color);
			background: color-mix(in srgb, var(--surface-accent-color) 12%, transparent);
		}
	}
</style>
