<script lang="ts">
	import { Detail } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';
	import IconLabel from './IconLabel.svelte';

	const {
		items
	}: {
		items: {
			label: string;
			href: string;
			icon: Component;
			active?: boolean;
			count?: number;
			badge?: boolean;
		}[][];
	} = $props();
</script>

<div class="menu">
	{#each items as group, i (group)}
		<div class="list">
			{#each group as { label: text, href, icon: Icon, active, count, badge } (href)}
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
							<span class="icon"><Icon /></span>
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
		gap: var(--a-spacing-4);

		.list {
			display: flex;
			flex-direction: column;
			gap: var(--a-spacing-1);
		}

		a {
			display: grid;
			grid-template-columns: 1fr auto;
			border-radius: 4px;
			padding: var(--a-spacing-1) var(--a-spacing-2);
			text-decoration: none;
			color: inherit;
			transition: background-color 100ms;

			&:focus-visible,
			&:hover {
				background-color: color-mix(in oklab, var(--brand-color) 12%, transparent);
				box-shadow: none;
			}

			&:active {
				background-color: color-mix(in oklab, var(--brand-color) 36%, transparent);
				box-shadow: none;
			}

			&.active {
				background-color: color-mix(in oklab, var(--brand-color) 24%, transparent);

				.label {
					font-weight: var(--a-font-weight-bold);
				}
			}

			.label {
				position: relative;

				:global(.badge) {
					color: var(--a-icon-danger);
					font-size: 0.5rem;
					position: absolute;
					top: 3px;
					right: -5px;
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
