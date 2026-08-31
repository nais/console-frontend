<script lang="ts">
	import { goto } from '$app/navigation';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import { Button, Tag } from '@nais/ds-svelte-community';
	import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';
	import { ArrowDownIcon, ArrowDownRightIcon, ArrowUpIcon } from '@nais/ds-svelte-community/icons';
	import { tick, type Component } from 'svelte';
	import ResultSkeleton from './ResultSkeleton.svelte';
	import SearchDocumentShortcuts from './SearchDocumentShortcuts.svelte';
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
		teamSlug?: string;
	};

	let {
		query = $bindable(),
		loading = false,
		results,
		close,
		suggestions = true,
		helpers = true,
		teamFilter = $bindable(),
		favoriteMode = false,
		showFavorites,
		toggleFavorites,
		exitFavorites,
		noResultsText,
		autofocus = false,
		placeholder = 'Search for teams, workloads, or services'
	}: {
		placeholder?: string;
		autofocus?: boolean;
		suggestions?: boolean;
		helpers?: boolean;
		teamFilter?: string;
		favoriteMode?: boolean;
		showFavorites?: () => void;
		toggleFavorites?: () => void;
		exitFavorites?: () => void;
		noResultsText?: string;
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
	let queryInput: HTMLInputElement | undefined = $state();
	const shortcutsEnabled = $derived(suggestions || Boolean(toggleFavorites));
	const canCompleteTeamFilter = $derived(
		Boolean(results?.[0]?.teamSlug && /^team:[^\s]+$/.test(query.trim()))
	);

	function focusWhenEnabled(node: HTMLInputElement, enabled: boolean) {
		if (enabled) {
			setTimeout(() => node.focus());
		}

		return {
			update(enabled: boolean) {
				if (enabled) {
					setTimeout(() => node.focus());
				}
			}
		};
	}

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

	function isTypingTarget(target: EventTarget | null) {
		if (!(target instanceof HTMLElement)) {
			return false;
		}

		return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
	}

	function onSearchKeydown(e: KeyboardEvent) {
		if (!suggestions && !toggleFavorites) {
			return;
		}

		if (toggleFavorites && e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyF') {
			toggleFavorites();
			showHelp = false;
			selected = 0;
			void tick().then(() => queryInput?.focus());
			e.preventDefault();
			return;
		}

		if (
			suggestions &&
			(!isTypingTarget(e.target) || !query) &&
			e.key === '?' &&
			!e.altKey &&
			!e.ctrlKey &&
			!e.metaKey
		) {
			void toggleHelp();
			e.preventDefault();
		}
	}

	function selectPrefix(prefix: string) {
		exitFavorites?.();
		query = `${prefix}:`;
		selected = 0;
		showHelp = false;
		void tick().then(() => queryInput?.focus());
	}

	function removeTeamFilter() {
		teamFilter = undefined;
		selected = 0;
		void tick().then(() => queryInput?.focus());
	}

	function selectFavorites() {
		if (favoriteMode) {
			toggleFavorites?.();
		} else {
			showFavorites?.();
		}
		selected = 0;
		showHelp = false;
		void tick().then(() => queryInput?.focus());
	}

	function completeTeamFilter() {
		const teamSuggestion = results?.[0]?.teamSlug;
		if (!teamSuggestion || !canCompleteTeamFilter) {
			return false;
		}

		teamFilter = teamSuggestion;
		query = '';
		selected = 0;
		return true;
	}

	function onQueryInput() {
		selected = 0;

		const match = /(^|\s)team:((?![a-z0-9-]*--)[a-z][a-z0-9-]{1,28}[a-z0-9])\s+/.exec(query);
		if (!match) {
			return;
		}

		const tokenStart = match.index + match[1].length;
		const tokenEnd = tokenStart + `team:${match[2]}`.length;
		teamFilter = match[2];
		query = `${query.slice(0, tokenStart)}${query.slice(tokenEnd)}`.replace(/\s+/g, ' ').trim();
	}

	function onQueryKeydown(e: KeyboardEvent) {
		if (e.key === 'Tab' && !e.shiftKey && completeTeamFilter()) {
			e.preventDefault();
			return;
		}

		if (e.key === 'Backspace' && teamFilter && !query) {
			removeTeamFilter();
			e.preventDefault();
			return;
		}

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
	}
</script>

{#if shortcutsEnabled}
	<SearchDocumentShortcuts onkeydown={onSearchKeydown} />
{/if}

<div class="search">
	<div class="header">
		<div class="search-field">
			<div class="query-input">
				{#if teamFilter}
					<button
						type="button"
						class="query-token"
						aria-label={`Remove team filter ${teamFilter}`}
						onclick={removeTeamFilter}
					>
						<span>team:{teamFilter}</span>
						<span aria-hidden="true">x</span>
					</button>
				{/if}
				<input
					aria-label="Search"
					bind:this={queryInput}
					use:focusWhenEnabled={autofocus}
					bind:value={query}
					oninput={onQueryInput}
					placeholder={teamFilter ? 'Search within team' : placeholder}
					onkeydown={onQueryKeydown}
				/>
			</div>
		</div>
		{#if suggestions}
			<Button variant="tertiary" size="small" aria-expanded={showHelp} onclick={toggleHelp}>
				Help
			</Button>
		{/if}
	</div>
	<div class="results" bind:this={res}>
		{#if showHelp && suggestions}
			<div class="suggestions">
				<Suggestions
					{selectPrefix}
					{teamFilter}
					{favoriteMode}
					selectFavorites={showFavorites ? selectFavorites : undefined}
				/>
			</div>
		{/if}
		{#if loading}
			{#each [0, 1, 2, 3, 4] as i (i)}
				<ResultSkeleton />
			{/each}
		{:else if results}
			{#each results as result, i (result)}
				{#if result.type === 'link'}
					<a href={result.href} class="result" class:selected={i === selected} onclick={close}>
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
					<div class="result" class:selected={i === selected}>
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
					<div>{noResultsText ?? `No results matching "${query}"`}</div>
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
			{#if canCompleteTeamFilter}
				<div>
					<kbd class="tab">tab</kbd>
					<span>Use team</span>
				</div>
			{/if}
			{#if toggleFavorites}
				<div>
					<kbd class="shortcut">alt f</kbd>
					<span>{favoriteMode ? 'Search' : 'Favorites'}</span>
				</div>
			{/if}
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
		border-radius: var(--ax-radius-8);
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
	.shortcut,
	.tab {
		font-size: 0.6rem;
		padding-inline: var(--ax-space-4);
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
	.search-field {
		display: grid;
		gap: var(--ax-space-8);
	}
	.query-input {
		display: flex;
		align-items: center;
		gap: var(--ax-space-6);
		min-height: 3rem;
		padding: var(--ax-space-4) var(--ax-space-8);
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-4);
		background-color: var(--ax-neutral-000);
	}
	.query-input:focus-within {
		outline: 2px solid var(--surface-accent-color);
		outline-offset: 2px;
	}
	.query-input input {
		min-width: 8rem;
		flex: 1;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--ax-text-neutral);
		font: inherit;
	}
	.query-token {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-6);
		flex: none;
		padding: var(--ax-space-4) var(--ax-space-8);
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-color: var(--surface-accent-color);
		border-radius: var(--ax-radius-4);
		background-color: var(--ax-neutral-000);
		color: var(--surface-accent-color);
		font: inherit;
		font-family: monospace;
		font-weight: var(--ax-font-weight-bold);
		cursor: pointer;
	}
	.query-token:focus-visible {
		outline: 2px solid var(--surface-accent-color);
		outline-offset: 2px;
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
