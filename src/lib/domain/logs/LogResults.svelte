<script lang="ts">
	import { getLogLevel, parseLogMessage } from '#lib/utils/logViewer.js';
	import { isFilterableLokiLabel, type LokiLabelFilter } from '#lib/utils/lokiLogQuery.js';
	import { BodyShort, Box, Button, CopyButton, Heading, Tooltip } from '@nais/ds-svelte-community';
	import { MinusIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import { logDate, type LogEntry } from './loki.js';

	let {
		entries,
		wrap,
		oldestFirst,
		onfilter
	}: {
		entries: LogEntry[];
		wrap: boolean;
		oldestFirst: boolean;
		onfilter?: (filter: LokiLabelFilter) => void;
	} = $props();
	const id = $props.id();
	let focusedAction = $state<string>();
	const displayed = $derived(oldestFirst ? entries.toReversed() : entries);

	function dismissTooltip(event: KeyboardEvent) {
		if (event.key === 'Escape') focusedAction = undefined;
	}

	function formatMessage(message: string): string {
		try {
			return JSON.stringify(JSON.parse(message), null, 2);
		} catch {
			return message;
		}
	}
</script>

<section aria-labelledby={id} class={{ wrap }}>
	<Heading as="h3" size="xsmall" class="aksel-sr-only" {id}>Log lines</Heading>
	<div class="lines">
		{#each displayed as entry, index (oldestFirst ? entries.length - index - 1 : index)}
			{const level = $derived(getLogLevel(entry.message))}
			{const date = $derived(logDate(entry.timestamp))}
			<details class="line" data-level={level}>
				<summary>
					<time datetime={date.toISOString()}>
						{date.toLocaleString('en-GB', {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit',
							hour: '2-digit',
							minute: '2-digit',
							second: '2-digit',
							fractionalSecondDigits: 3
						})}</time
					>
					<span class="level">{level}</span>
					<span class="message">{parseLogMessage(entry.message)}</span>
				</summary>
				<div class="expanded">
					<Box
						background="default"
						borderColor="neutral-subtleA"
						borderWidth="1"
						borderRadius="12"
						padding="space-16"
					>
						<div class="entry-details">
							<section class="message-section" aria-labelledby={`${id}-${index}-message`}>
								<div class="message-header">
									<Heading as="h4" size="xsmall" id={`${id}-${index}-message`}>Message</Heading>
									<CopyButton copyText={entry.message} size="xsmall" text="Copy log line" />
								</div>
								<pre>{formatMessage(entry.message)}</pre>
							</section>
							<section class="labels-section" aria-labelledby={`${id}-${index}-labels`}>
								<div class="labels-header">
									<Heading as="h4" size="xsmall" id={`${id}-${index}-labels`}>Labels</Heading>
									<BodyShort size="small">
										{#if onfilter}
											Include or exclude a label value. Workload scope labels are fixed.
										{:else}
											Use filters to filter by label values.
										{/if}
									</BodyShort>
								</div>
								<dl class="settings-list">
									{#each Object.entries(entry.labels) as [key, value] (key)}
										<dt>{key}</dt>
										<dd>
											<span class="label-value">{value}</span>
											{#if onfilter && isFilterableLokiLabel(key)}
												<div class="label-actions">
													<Tooltip
														content="Include this value"
														open={focusedAction === `include:${index}:${key}`}
													>
														<Button
															type="button"
															variant="tertiary-neutral"
															size="xsmall"
															icon={PlusIcon}
															aria-label={`Include ${key} = ${value}`}
															onfocus={() => (focusedAction = `include:${index}:${key}`)}
															onblur={() => (focusedAction = undefined)}
															onkeydown={dismissTooltip}
															onclick={() => {
																focusedAction = undefined;
																onfilter?.({ name: key, operator: '=', value });
															}}
														/>
													</Tooltip>
													<Tooltip
														content="Exclude this value"
														open={focusedAction === `exclude:${index}:${key}`}
													>
														<Button
															type="button"
															variant="tertiary-neutral"
															size="xsmall"
															icon={MinusIcon}
															aria-label={`Exclude ${key} = ${value}`}
															onfocus={() => (focusedAction = `exclude:${index}:${key}`)}
															onblur={() => (focusedAction = undefined)}
															onkeydown={dismissTooltip}
															onclick={() => {
																focusedAction = undefined;
																onfilter?.({ name: key, operator: '!=', value });
															}}
														/>
													</Tooltip>
												</div>
											{/if}
										</dd>
									{/each}
								</dl>
							</section>
							<div class="timestamp">
								<BodyShort size="small">Timestamp (ns): <code>{entry.timestamp}</code></BodyShort>
							</div>
						</div>
					</Box>
				</div>
			</details>
		{/each}
	</div>
</section>

<style>
	.lines {
		overflow-x: auto;
		font-size: var(--ax-font-size-small);
	}

	summary,
	pre,
	code,
	dt,
	.label-value {
		font-family: monospace;
	}

	.line {
		border-bottom: var(--ax-space-1) solid var(--ax-border-neutral-subtleA);
	}

	summary {
		display: flex;
		align-items: baseline;
		gap: var(--ax-space-12);
		padding: var(--ax-space-8);
		cursor: pointer;
	}

	summary::before {
		content: '+';
	}

	details[open] > summary::before {
		content: '-';
	}

	summary:focus-visible {
		outline: var(--ax-space-2) solid var(--ax-border-focus);
		outline-offset: calc(-1 * var(--ax-space-2));
	}

	time,
	.level {
		white-space: nowrap;
	}

	.level {
		min-width: 5ch;
		font-weight: var(--ax-font-weight-bold);
	}

	[data-level='ERROR'] .level,
	[data-level='FATAL'] .level {
		color: var(--ax-text-danger);
	}

	[data-level='WARN'] .level,
	[data-level='WARNING'] .level {
		color: var(--ax-text-warning);
	}

	.message {
		white-space: pre;
	}

	.wrap .message {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		min-width: 0;
	}

	.expanded {
		padding: var(--ax-space-8) var(--ax-space-8) var(--ax-space-16);
		min-width: 0;
	}

	.entry-details,
	.message-section,
	.labels-section,
	.labels-header {
		display: grid;
		min-width: 0;
	}

	.entry-details {
		gap: var(--ax-space-24);
	}

	.message-section,
	.labels-section {
		gap: var(--ax-space-12);
	}

	.labels-header {
		gap: var(--ax-space-4);
	}

	.message-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
	}

	pre {
		margin: 0;
		padding: var(--ax-space-12);
		background: var(--ax-bg-neutral-soft);
		border-radius: var(--ax-radius-8);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	dt {
		overflow-wrap: anywhere;
	}

	dd {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
		min-width: 0;
	}

	.label-value {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.timestamp {
		border-top: var(--ax-space-1) solid var(--ax-border-neutral-subtleA);
		padding-top: var(--ax-space-12);
		overflow-wrap: anywhere;
	}

	.label-actions {
		display: flex;
		flex-shrink: 0;
		flex-wrap: wrap;
		gap: var(--ax-space-2);
	}

	.label-actions :global(button) {
		min-width: var(--ax-space-24);
		min-height: var(--ax-space-24);
	}

	.label-actions :global(.aksel-button__icon svg) {
		width: var(--ax-space-16);
		height: var(--ax-space-16);
	}

	@media (max-width: 767px) {
		summary {
			flex-wrap: wrap;
			gap: var(--ax-space-8);
		}

		.message {
			flex-basis: 100%;
		}
	}
</style>
