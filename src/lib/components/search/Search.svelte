<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, TextField } from '@nais/ds-svelte-community';
	import { XMarkIcon } from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';
	import IconLabel from '../IconLabel.svelte';
	import ResultSkeleton from './ResultSkeleton.svelte';
	import Suggestions from './Suggestions.svelte';

	let {
		query = $bindable(),
		loading = false,
		results,
		close,
		suggestions = true,
		placeholder = 'Search for teams, workloads, or services'
	}: {
		placeholder?: string;
		suggestions?: boolean;
		query: string;
		loading?: boolean;
		results?:
			| {
					icon: Component;
					label: string;
					description: string;
					type: 'link';
					href: string;
			  }[]
			| {
					icon: Component;
					label: string;
					description: string;
					type: 'button';
					button: {
						onclick: () => void;
						label: string;
						variant:
							| 'primary'
							| 'secondary'
							| 'tertiary'
							| 'primary-neutral'
							| 'secondary-neutral'
							| 'tertiary-neutral'
							| 'danger';
						loading?: boolean;
					};
			  }[];
		close: () => void;
	} = $props();

	let selected = $state(0);
</script>

<div class="search">
	<div class="header">
		<TextField
			bind:value={query}
			oninput={() => (selected = 0)}
			label="Search"
			hideLabel
			{placeholder}
			onkeydown={(e) => {
				if (results) {
					if (e.key === 'ArrowDown') {
						selected = Math.min(results.length - 1, selected + 1);
						e.preventDefault();
					} else if (e.key === 'ArrowUp') {
						selected = Math.max(0, selected - 1);
						e.preventDefault();
					} else if (e.key === 'Enter') {
						const s = results[selected];
						if (s.type === 'link') {
							goto(s.href);
							close();
						}
					}
				}
			}}
		/>
		<Button icon={XMarkIcon} variant="tertiary-neutral" onclick={close} />
	</div>
	<div class="results">
		{#if loading}
			{#each [0, 1, 2, 3, 4] as i (i)}
				<ResultSkeleton />
			{/each}
		{:else if results}
			{#each results as { icon, description, label: text, ...rest }, i (icon + text + i)}
				{#if rest.type === 'link'}
					<a href={rest.href} class={['result', { selected: i === selected }]} onclick={close}>
						<IconLabel {icon} {description}>
							{#snippet label()}
								<span class="label">{text}</span>
							{/snippet}
						</IconLabel>
					</a>
				{:else}
					<div class="result">
						<IconLabel {icon} label={text} {description} />
						{#if rest.type === 'button'}
							{@const button = rest.button}
							<Button {...button} size="small">{button.label}</Button>
						{/if}
					</div>
				{/if}
			{:else}
				<div class="no-results">
					<div>No results matching "{query}"</div>
					{#if query.includes(':') && suggestions}
						<Suggestions />
					{/if}
				</div>
			{/each}
		{:else if suggestions}
			<Suggestions />
		{/if}
	</div>
</div>

<style>
	.search {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-4);
	}
	.header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--a-spacing-2);
	}
	.results {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-1);
		overflow-y: auto;

		a.result {
			color: inherit;
			text-decoration: none;
			transition:
				background-color 50ms,
				color 50ms;

			&:hover {
				background-color: var(--a-surface-action-subtle-hover);
				text-decoration: none;

				.label {
					text-decoration: underline;
				}
			}
			&:active,
			&:focus-visible {
				background-color: var(--a-surface-action);
				color: var(--a-text-on-action);
				box-shadow: none;
			}

			&:active {
				background-color: var(--a-surface-action-active);
			}
		}

		.result {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: var(--a-spacing-4);
			align-items: center;
			border-radius: 4px;
			padding: var(--a-spacing-1);

			&.selected {
				background-color: var(--a-surface-selected);
			}
		}
	}
	.no-results {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-4);
	}
</style>
