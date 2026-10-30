<script lang="ts">
	import { goto } from '$app/navigation';
	import { ShBadge, ShButton } from '#lib/shadcn/ui/index.js';

	import IconLabel from '#lib/ui/IconLabel.svelte';
	import type { TagProps } from '#lib/shadcn/ui/index.js';
	import {
		ArrowDownIcon,
		ArrowDownRightIcon,
		ArrowUpIcon,
		MagnifyingGlassIcon
	} from '#lib/icons/index.js';
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

	function focusWhenEnabled(node: HTMLInputElement) {
		const timeout = setTimeout(() => node.focus());
		return () => clearTimeout(timeout);
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
				<span class="search-lead-icon" aria-hidden="true">
					<MagnifyingGlassIcon />
				</span>
				{#if teamFilter}
					<button
						type="button"
						class="query-token"
						aria-label={`Remove team filter ${teamFilter}`}
						onclick={removeTeamFilter}
					>
						<span>team:{teamFilter}</span>
						<span aria-hidden="true">&times;</span>
					</button>
				{/if}
				<input
					aria-label="Search"
					bind:this={queryInput}
					{@attach autofocus && focusWhenEnabled}
					bind:value={query}
					oninput={onQueryInput}
					placeholder={teamFilter ? 'Search within team…' : placeholder}
					onkeydown={onQueryKeydown}
				/>
			</div>
		</div>
		{#if suggestions}
			<ShButton variant="ghost" size="sm" ariaExpanded={showHelp} onclick={toggleHelp}>
				Help
			</ShButton>
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
										<ShBadge variant="secondary" mono>{result.tag.label}</ShBadge>
										<span>{result.description}</span>
									</div>
								{:else}
									{result.description}
								{/if}
							{/snippet}
						</IconLabel>
						{#if result.badge}
							<ShBadge variant="outline">{result.badge}</ShBadge>
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
										<ShBadge variant="secondary" mono>{result.tag.label}</ShBadge>
										<span>{result.description}</span>
									</div>
								{:else}
									{result.description}
								{/if}
							{/snippet}
						</IconLabel>
						<div class="result-actions">
							{#if result.badge}
								<ShBadge variant="outline">{result.badge}</ShBadge>
							{/if}
							{#if result.type === 'button'}
								<ShButton
									variant={result.button.variant === 'danger' ? 'destructive' : 'outline'}
									size="sm"
									disabled={result.button.loading}
									onclick={result.button.onclick}
								>
									{result.button.label}
								</ShButton>
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
					<kbd class="sh-kbd">?</kbd>
					<span>Help</span>
				</div>
			{/if}
			<div>
				<kbd class="sh-kbd"><ArrowDownIcon /></kbd>
				<kbd class="sh-kbd"><ArrowUpIcon /></kbd>
				<span>Move</span>
			</div>
			<div>
				<kbd class="sh-kbd enter"><ArrowDownRightIcon /></kbd>
				<span>Select</span>
			</div>
			{#if canCompleteTeamFilter}
				<div>
					<kbd class="sh-kbd">tab</kbd>
					<span>Use team</span>
				</div>
			{/if}
			{#if toggleFavorites}
				<div>
					<kbd class="sh-kbd">alt f</kbd>
					<span>{favoriteMode ? 'Search' : 'Favorites'}</span>
				</div>
			{/if}
			<div>
				<kbd class="sh-kbd">esc</kbd>
				<span>Close</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.description-wrapper {
		display: flex;
		gap: 0.375rem;
		align-items: center;
	}

	.result-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.helpers {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 0.625rem 1rem;
		border-top: 1px solid var(--border);
		background-color: var(--background-subtle);
		font-size: 0.75rem;
		color: var(--muted-foreground);

		> div {
			display: flex;
			gap: 0.35rem;
			align-items: center;

			&:last-child {
				margin-left: auto;
			}
		}
	}

	.suggestions {
		padding-bottom: 0.625rem;
	}

	.enter > :global(svg) {
		transform: scaleX(-1);
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
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
	}

	.search-field {
		display: grid;
		gap: 0.5rem;
	}

	.query-input {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.25rem;
	}

	.search-lead-icon {
		display: inline-flex;
		align-items: center;
		color: var(--muted-foreground);
		font-size: 1rem;
		flex-shrink: 0;
	}

	.query-input input {
		min-width: 8rem;
		flex: 1;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--foreground);
		font: inherit;
		font-size: 0.875rem;
	}

	.query-input input::placeholder {
		color: var(--muted-foreground);
	}

	.query-token {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		flex: none;
		padding: 0.15rem 0.45rem;
		border: 1px solid var(--primary-border);
		border-radius: calc(var(--radius) - 4px);
		background-color: var(--primary-muted);
		color: var(--primary);
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
	}

	.results {
		display: flex;
		padding: 0.5rem;
		flex-direction: column;
		gap: 0.125rem;
		overflow-y: auto;

		a.result {
			color: inherit;
			text-decoration: none;
			transition: background-color 100ms ease;

			&:hover {
				background-color: var(--secondary);
				text-decoration: none;
			}
		}

		.result {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: 0.75rem;
			align-items: center;
			border-radius: calc(var(--radius) - 3px);
			padding: 0.45rem 0.625rem;

			&.selected {
				background-color: var(--secondary);
			}
		}
	}

	.no-results {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2.5rem 1rem;
		color: var(--muted-foreground);
		font-size: 0.8125rem;
	}
</style>
