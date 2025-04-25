<script lang="ts">
	import { Detail } from '@nais/ds-svelte-community';
	import Icon from './Icon.svelte';
	import IconLabel from './IconLabel.svelte';

	const {
		items
	}: {
		items: {
			label: string;
			href: string;
			active?: boolean;
			count?: number;
		}[][];
	} = $props();
</script>

<div class="menu">
	{#each items as group (group)}
		<div class="list">
			{#each group as { label: text, href, active, count } (href)}
				<a {href} class:active>
					<IconLabel>
						{#snippet label()}
							<span class="label">
								{text}
							</span>
						{/snippet}
						{#snippet icon()}
							<span class="icon"><Icon icon={text} /></span>
						{/snippet}
					</IconLabel>
					{#if count}
						<Detail>{count}</Detail>
					{/if}
				</a>
			{/each}
		</div>
	{/each}
</div>

<style>
	.menu {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-20, --a-spacing-5);

		.list {
			display: flex;
			flex-direction: column;
			gap: var(--ax-space-4, --a-spacing-1);
		}

		a {
			display: grid;
			grid-template-columns: 1fr auto;
			border-radius: 4px;
			padding: var(--ax-space-4, --a-spacing-1) var(--ax-space-12, --a-spacing-3)
				var(--ax-space-4, --a-spacing-1) var(--ax-space-8, --a-spacing-2);
			text-decoration: none;
			color: inherit;
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

			&:not(.active) .icon {
				color: var(--ax-text-subtle, --a-text-subtle);
			}

			.icon {
				display: contents;
			}
		}
	}
</style>
