<script lang="ts">
	import { BodyShort, Checkbox, ReadMore, Search } from '#lib/shadcn/ui/index.js';

	let {
		available,
		selected,
		initial,
		locked = []
	}: {
		available: readonly string[];
		selected: readonly string[];
		initial?: readonly string[];
		/** Extensions that are always kept (e.g. inherited from a clone source): checked and disabled. */
		locked?: readonly string[];
	} = $props();

	let search = $state('');
	const uid = $props.id();
	let incomingSelection = $derived(selected);
	let draft = $state.raw<{ source: readonly string[]; values: readonly string[] }>();
	let selection = $derived(draft?.source === incomingSelection ? draft.values : incomingSelection);
	let options = $derived([...new Set([...locked, ...available, ...incomingSelection])]);
	let normalizedSearch = $derived(search.trim().toLowerCase());
	let matches = $derived(
		options.filter((extension) => extension.toLowerCase().includes(normalizedSearch))
	);
	let effective = $derived([...new Set([...locked, ...selection])]);
	let summary = $derived(
		effective.length
			? `${effective.length} selected: ${effective.slice(0, 3).join(', ')}${effective.length > 3 ? `, +${effective.length - 3} more` : ''}`
			: 'None selected'
	);

	function toggleExtension(extension: string, checked: boolean) {
		draft = {
			source: incomingSelection,
			values: checked ? [...selection, extension] : selection.filter((value) => value !== extension)
		};
	}
</script>

<fieldset aria-describedby="{uid}-summary">
	<legend>Extensions</legend>
	<BodyShort size="small" id="{uid}-summary">{summary}</BodyShort>
	<input type="hidden" name="extensionsPresent" value="true" />
	{#if initial}
		<input type="hidden" name="initialExtensionsPresent" value="true" />
		{#each initial as extension (extension)}
			<input type="hidden" name="initialExtensions" value={extension} />
		{/each}
	{/if}
	{#if options.length}
		<ReadMore header="Choose extensions" size="small">
			<div class="extension-picker">
				<BodyShort size="small">
					Select extensions to activate in the application database.
				</BodyShort>
				<Search
					label="Search extensions"
					placeholder="Search extensions"
					size="small"
					variant="simple"
					bind:value={search}
					onkeydown={(event) => {
						if (event.key === 'Enter') event.preventDefault();
					}}
				/>
				<div class="extension-options">
					{#each options as extension (extension)}
						<div hidden={!matches.includes(extension)}>
							{#if locked.includes(extension)}
								<input type="hidden" name="extensions" value={extension} />
							{/if}
							<Checkbox
								name={locked.includes(extension) ? undefined : 'extensions'}
								value={extension}
								size="small"
								checked={locked.includes(extension) || selection.includes(extension)}
								disabled={locked.includes(extension)}
								onchange={(event) => toggleExtension(extension, event.currentTarget.checked)}
								description={locked.includes(extension)
									? 'From the source.'
									: available.includes(extension)
										? undefined
										: 'Already configured, but no longer available for new selections. Kept unless you remove it.'}
							>
								{extension}
							</Checkbox>
						</div>
					{/each}
					{#if !matches.length}
						<BodyShort size="small" role="status">No extensions match your search.</BodyShort>
					{/if}
				</div>
			</div>
		</ReadMore>
	{:else}
		<BodyShort>No extensions are available in this environment.</BodyShort>
	{/if}
</fieldset>

<style>
	fieldset {
		min-width: 0;
		margin: 0;
		padding: 0;
		border: none;
		display: grid;
		gap: var(--nais-space-8);
	}

	legend {
		margin-bottom: var(--nais-space-4);
		font-size: var(--sh-font-size-sm);
		font-weight: var(--sh-font-weight-semibold);
	}

	.extension-picker {
		display: grid;
		gap: var(--nais-space-8);
	}

	.extension-options {
		max-height: calc(var(--nais-space-64) * 4);
		overflow-y: auto;
		overscroll-behavior: contain;
	}
</style>
