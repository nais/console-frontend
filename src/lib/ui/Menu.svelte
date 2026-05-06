<script lang="ts">
	import Icon from './Icon.svelte';
	import IconLabel from './IconLabel.svelte';

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
	{#each items as group (group)}
		<div class="list">
			{#each group as { label: text, href, active } (href)}
				<a {href} class:active onclick={onItemSelect}>
					<IconLabel size="small">
						{#snippet label()}
							<span class="label">
								{text}
							</span>
						{/snippet}
						{#snippet icon()}
							<span class="icon"><Icon icon={text} /></span>
						{/snippet}
					</IconLabel>
				</a>
			{/each}
		</div>
	{/each}
</div>

<style>
	.menu {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);

		.list {
			display: flex;
			flex-direction: column;
			gap: var(--ax-space-2);
		}

		a {
			display: grid;
			grid-template-columns: 1fr auto;
			border-radius: 4px;
			padding: var(--ax-space-2) var(--ax-space-8);
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

				.icon {
					color: var(--ax-text-subtle);
				}
			}

			&:not(.active) .icon {
				color: var(--ax-text-subtle);
			}

			.icon {
				display: contents;
				font-size: 1rem;
			}
		}
	}
</style>
