<script lang="ts">
	let {
		selectPrefix,
		selectFavorites,
		teamFilter,
		favoriteMode
	}: {
		selectPrefix: (prefix: string) => void;
		selectFavorites?: () => void;
		teamFilter?: string;
		favoriteMode?: boolean;
	} = $props();

	const prefixes = [
		{ prefix: 'app', label: 'Application' },
		{ prefix: 'team', label: 'Team' },
		{ prefix: 'job', label: 'Job' },
		{ prefix: 'kafka', label: 'Kafka' },
		{ prefix: 'bq', label: 'BigQuery' },
		{ prefix: 'bucket', label: 'Bucket' },
		{ prefix: 'os', label: 'OpenSearch' },
		{ prefix: 'postgres', label: 'Postgres' },
		{ prefix: 'sql', label: 'Cloud SQL' },
		{ prefix: 'valkey', label: 'Valkey' }
	] as const;
</script>

<div class="suggestions-panel">
	<div class="intro">
		<strong>Filter by type</strong>
		<p>Start your search with a prefix.</p>
	</div>
	<div class="prefixes" aria-label="Search prefixes">
		{#each prefixes as { prefix, label } (prefix)}
			<button type="button" class="prefix" onclick={() => selectPrefix(prefix)}>
				<code>{prefix}:</code>
				<span>{label}</span>
			</button>
		{/each}
	</div>
	{#if !teamFilter}
		<div class="scope">
			<span>Within a team</span>
			<div class="hint">
				<code>team:&lt;slug&gt;</code>
				<span>then Space</span>
			</div>
		</div>
	{/if}
	{#if selectFavorites}
		<div class="scope">
			<span>Show</span>
			<button type="button" class="prefix" aria-pressed={favoriteMode} onclick={selectFavorites}>
				<code>{favoriteMode ? 'search' : 'favorites'}</code>
				<span>Alt F</span>
			</button>
		</div>
	{/if}
</div>

<style>
	.suggestions-panel {
		display: grid;
		gap: 0.65rem;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) - 2px);
		background-color: var(--background-subtle);
		font-size: 0.8125rem;
	}

	.intro {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	p {
		margin: 0;
		color: var(--muted-foreground);
	}

	.prefixes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.scope {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border);
		color: var(--foreground);
	}

	.scope > span {
		font-weight: 600;
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}

	.prefix {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) - 4px);
		background-color: var(--card);
		color: var(--foreground);
		font-size: 0.75rem;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 120ms ease,
			background-color 120ms ease;
	}

	.prefix:hover {
		border-color: var(--primary-border);
		background-color: var(--secondary);
	}

	.prefix:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	.hint {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.2rem 0.5rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) - 4px);
		background-color: var(--card);
		color: var(--muted-foreground);
		font-size: 0.75rem;
	}

	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-weight: 600;
		color: var(--primary);
	}
</style>
