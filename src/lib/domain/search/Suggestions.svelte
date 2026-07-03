<script lang="ts">
	let {
		selectPrefix,
		selectTeam,
		currentTeam,
		teamFilter
	}: {
		selectPrefix: (prefix: string) => void;
		selectTeam: () => void;
		currentTeam?: string;
		teamFilter?: string;
	} = $props();

	const prefixes = [
		{ prefix: 'app', label: 'Application' },
		{ prefix: 'team', label: 'Team' },
		{ prefix: 'job', label: 'Job' },
		{ prefix: 'kafka', label: 'Kafka topic' },
		{ prefix: 'bq', label: 'BigQuery dataset' },
		{ prefix: 'bucket', label: 'Bucket' },
		{ prefix: 'os', label: 'OpenSearch' },
		{ prefix: 'postgres', label: 'Postgres' },
		{ prefix: 'sql', label: 'Cloud SQL' },
		{ prefix: 'valkey', label: 'Valkey' }
	] as const;
</script>

<div class="suggestions-panel">
	<div>
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
	{#if currentTeam && !teamFilter}
		<div>
			<strong>Narrow scope</strong>
			<button type="button" class="prefix team-prefix" onclick={selectTeam}>
				<code>team:{currentTeam}</code>
				<span>Current team</span>
			</button>
		</div>
	{/if}
</div>

<style>
	.suggestions-panel {
		display: grid;
		gap: var(--ax-space-12);
		padding: var(--ax-space-16);
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-4);
		background-color: var(--ax-neutral-100);
	}

	p {
		margin: var(--ax-space-2) 0 0;
		color: var(--ax-text-neutral);
	}

	.prefixes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: var(--ax-space-8);
	}

	.team-prefix {
		margin-top: var(--ax-space-8);
	}

	.prefix {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-8) var(--ax-space-12);
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-4);
		background-color: var(--ax-neutral-000);
		color: var(--ax-text-neutral);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.prefix:hover {
		border-color: var(--surface-accent-color);
	}

	.prefix:focus-visible {
		outline: 2px solid var(--surface-accent-color);
		outline-offset: 2px;
	}

	code {
		font-family: monospace;
		font-weight: var(--ax-font-weight-bold);
		color: var(--surface-accent-color);
	}
</style>
