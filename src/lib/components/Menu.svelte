<script lang="ts">
	import { Detail } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from './IconLabel.svelte';
	import Icon from './icons/Icon.svelte';

	const {
		items
	}: {
		items: {
			label: string;
			href: string;
			active?: boolean;
			count?: number;
			badge?: boolean;
		}[][];
	} = $props();
</script>

<div class="menu">
	{#each items as group (group)}
		<div class="list">
			{#each group as { label: text, href, active, count, badge } (href)}
				<a {href} class:active>
					<IconLabel>
						{#snippet label()}
							<span class="label">
								{text}
								{#if badge}
									<CircleFillIcon class="badge" />
								{/if}
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
		gap: var(--a-spacing-5);

		.list {
			display: flex;
			flex-direction: column;
			gap: var(--a-spacing-05);
		}

		a {
			display: grid;
			grid-template-columns: 1fr auto;
			border-radius: 4px;
			padding: var(--a-spacing-1) var(--a-spacing-3) var(--a-spacing-1) var(--a-spacing-2);
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

			.label {
				:global(.badge) {
					color: var(--a-red-300);
					font-size: 0.5rem;
					position: relative;
					top: -8px;
					right: 2px;
				}
			}
			&:not(.active) .icon {
				color: var(--a-text-subtle);
			}

			.icon {
				display: contents;
			}
		}
	}
</style>
