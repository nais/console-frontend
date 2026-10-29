<script lang="ts">
	import { BodyShort, Checkbox, Fieldset, ReadMore, Search } from '@nais/ds-svelte-community';

	let {
		available,
		selected,
		initial
	}: {
		available: readonly string[];
		selected: readonly string[];
		initial?: readonly string[];
	} = $props();

	let search = $state('');
	let draft = $state.raw<{ source: readonly string[]; values: readonly string[] }>();
	let selection = $derived(draft?.source === selected ? draft.values : selected);
	let options = $derived([...new Set([...available, ...selected])]);
	let normalizedSearch = $derived(search.trim().toLowerCase());
	let matches = $derived(
		options.filter((extension) => extension.toLowerCase().includes(normalizedSearch))
	);
	let summary = $derived(
		selection.length
			? `${selection.length} selected: ${selection.slice(0, 3).join(', ')}${selection.length > 3 ? `, +${selection.length - 3} more` : ''}`
			: 'None selected'
	);

	function toggleExtension(extension: string, checked: boolean) {
		draft = {
			source: selected,
			values: checked ? [...selection, extension] : selection.filter((value) => value !== extension)
		};
	}
</script>

<Fieldset legend="Extensions" description={summary}>
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
					Select extensions to make available to databases in this Postgres instance.
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
							<Checkbox
								name="extensions"
								value={extension}
								size="small"
								checked={selection.includes(extension)}
								onchange={(event) => toggleExtension(extension, event.currentTarget.checked)}
								description={available.includes(extension)
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
</Fieldset>

<style>
	.extension-picker {
		display: grid;
		gap: var(--ax-space-8);
	}

	.extension-options {
		max-height: calc(var(--ax-space-64) * 4);
		overflow-y: auto;
		overscroll-behavior: contain;
	}
</style>
