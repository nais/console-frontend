<script lang="ts">
	import { goto } from '$app/navigation';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import { Button, Tag, TextField } from '@nais/ds-svelte-community';
	import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';
	import { ArrowDownIcon, ArrowDownRightIcon, ArrowUpIcon } from '@nais/ds-svelte-community/icons';
	import { tick, type Component } from 'svelte';
	import ResultSkeleton from './ResultSkeleton.svelte';
	import Suggestions from './Suggestions.svelte';

	type TagType = {
		label: string;
		variant: TagProps['variant'];
	};

	type ResultBase = {
		icon: Component;
		label: string;
		description: string;
		tag?: TagType;
		badge?: string;
	};

	let {
		query = $bindable(),
		loading = false,
		results,
		close,
		suggestions = true,
		helpers = true,
		placeholder = 'Search for teams, workloads, or services'
	}: {
		placeholder?: string;
		suggestions?: boolean;
		helpers?: boolean;
		query: string;
		loading?: boolean;
		results?:
			| (ResultBase & {
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
			  })[]
			| (ResultBase & {
					type: 'link';
					href: string;
			  })[];
		close: () => void;
	} = $props();

	let selected = $state(0);
	let showHelp = $state(false);

	let res: HTMLDivElement | undefined = $state();

	const scrollSelectedIntoView = () => {
		const selectedElement = res?.querySelector('.result.selected');
		if (selectedElement) {
			selectedElement.scrollIntoView({ block: 'nearest' });
		}
	};

	async function toggleHelp() {
		showHelp = !showHelp;

		if (showHelp) {
			await tick();
			res?.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function onSearchKeydown(e: KeyboardEvent) {
		if (suggestions && e.key === '?' && !e.altKey && !e.ctrlKey && !e.metaKey) {
			void toggleHelp();
			e.preventDefault();
		}
	}
</script>

<svelte:document onkeydown={onSearchKeydown} />

<div class="search">
	<div class="header">
		<TextField
			bind:value={query}
			oninput={() => (selected = 0)}
			label="Search"
			hideLabel
			{placeholder}
			onkeydown={(e) => {
				if (results?.length) {
					if (e.key === 'ArrowDown') {
						selected = Math.min(results.length - 1, selected + 1);
						tick().then(scrollSelectedIntoView);
						e.preventDefault();
					} else if (e.key === 'ArrowUp') {
						selected = Math.max(0, selected - 1);
						tick().then(scrollSelectedIntoView);
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
		{#if suggestions}
			<Button variant="tertiary" size="small" aria-expanded={showHelp} onclick={toggleHelp}>
				Help
			</Button>
		{/if}
	</div>
	<div class="results" bind:this={res}>
		{#if showHelp && suggestions}
			<div class="suggestions">
				<Suggestions />
			</div>
		{/if}
		{#if loading}
			{#each [0, 1, 2, 3, 4] as i (i)}
				<ResultSkeleton />
			{/each}
		{:else if results}
			{#each results as result, i (result)}
				{#if result.type === 'link'}
					<a href={result.href} class={['result', { selected: i === selected }]} onclick={close}>
						<IconLabel icon={result.icon}>
							{#snippet label()}
								<span class="label">{result.label}</span>
							{/snippet}
							{#snippet description()}
								{#if result.tag}
									<div class="description-wrapper">
										<Tag size="xsmall" variant={result.tag.variant}>{result.tag.label}</Tag>
										{result.description}
									</div>
								{:else}
									{result.description}
								{/if}
							{/snippet}
						</IconLabel>
						{#if result.badge}
							<span class="result-badge">{result.badge}</span>
						{/if}
					</a>
				{:else}
					<div class="result">
						<IconLabel icon={result.icon}>
							{#snippet label()}
								<span class="label">{result.label}</span>
							{/snippet}
							{#snippet description()}
								{#if result.tag}
									<div class="description-wrapper">
										<Tag size="xsmall" variant={result.tag.variant}>{result.tag.label}</Tag>
										{result.description}
									</div>
								{:else}
									{result.description}
								{/if}
							{/snippet}
						</IconLabel>
						<div class="result-actions">
							{#if result.badge}
								<span class="result-badge">{result.badge}</span>
							{/if}
							{#if result.type === 'button'}
								<Button {...result.button} size="small">{result.button.label}</Button>
							{/if}
						</div>
					</div>
				{/if}
			{:else}
				<div class="no-results">
					<div>No results matching "{query}"</div>
				</div>
			{/each}
		{/if}
	</div>
	{#if helpers}
		<div class="helpers">
			{#if suggestions}
				<div>
					<kbd class="question">?</kbd>
					<span>Help</span>
				</div>
			{/if}
			<div>
				<kbd><ArrowDownIcon /></kbd>
				<kbd><ArrowUpIcon /></kbd>
				<span>Move</span>
			</div>
			<div>
				<kbd class="enter"><ArrowDownRightIcon /></kbd>
				<span>Select</span>
			</div>
			<div>
				<kbd class="escape"><span>esc</span></kbd>
				<span>Close</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.description-wrapper {
		display: flex;
		gap: var(--ax-space-6);
		align-items: center;
	}
	.result-actions {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}
	.result-badge {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		color: var(--surface-accent-color);
		text-transform: uppercase;
		white-space: nowrap;
	}
	.helpers {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-16);
		padding: var(--ax-space-12) var(--ax-space-24);
		border-top: 1px solid var(--ax-border-neutral-subtleA);
		background-color: var(--ax-bg-default);

		> div {
			display: flex;
			gap: var(--ax-space-8);
			align-items: center;

			&:last-child {
				margin-left: auto;
			}
		}
	}
	.suggestions {
		padding-bottom: var(--ax-space-12);
	}

	.enter > :global(svg) {
		transform: scaleX(-1);
	}
	kbd {
		font-size: 1rem;
		background: linear-gradient(
			rgb(255, 255, 255, 0.1),
			rgb(255, 255, 255, 0.1),
			rgba(18, 43, 68, 0.08)
		);
		border: solid 1px rgb(35, 38, 42);
		border-radius: 6px;
		padding: var(--ax-space-4);
		display: inline-flex;
		justify-content: center;
	}
	.escape {
		font-size: 0.6rem;
		width: 26px;
		padding-inline: 0;
		line-height: 1rem;
	}
	.question {
		width: 26px;
		padding-inline: 0;
		line-height: 1rem;
	}
	.search {
		height: 100%;
		display: grid;
		grid-template-rows: auto 1fr auto;
		flex-direction: column;
	}
	.header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-24);
		padding-bottom: var(--ax-space-16);
	}
	.results {
		display: flex;
		padding-inline: var(--ax-space-24);
		flex-direction: column;
		gap: var(--ax-space-4);
		overflow-y: auto;

		a.result {
			color: inherit;
			text-decoration: none;
			transition:
				background-color 50ms,
				color 50ms;

			&:hover {
				background-color: var(--ax-bg-brand-blue-moderate-hover);
				text-decoration: none;

				.label {
					text-decoration: underline;
				}
			}
			&:active,
			&:focus-visible {
				background-color: var(--ax-bg-accent-strong);
				color: var(--ax-text-neutral);
				box-shadow: none;
			}

			&:active {
				background-color: var(--ax-bg-accent-strong-hover);
			}
		}

		.result {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: var(--ax-space-16);
			align-items: center;
			border-radius: var(--ax-radius-4);
			padding: var(--ax-space-4);

			&.selected {
				background-color: var(--ax-bg-accent-moderate-pressed);
			}
		}
	}
	.no-results {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}
</style>
