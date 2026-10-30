<script lang="ts">
	import ChartBoundary from '#lib/chart/ChartBoundary.svelte';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import { environmentCluster } from '#lib/utils/environmentCluster.js';
	import {
		addLokiLabelFilter,
		buildLokiLogQuery,
		type LokiLabelFilter
	} from '#lib/utils/lokiLogQuery.js';
	import {
		Alert,
		Button,
		Checkbox,
		Chips,
		Heading,
		Popover,
		RemovableChip,
		Select,
		Textarea,
		TextField,
		Tooltip
	} from '@nais/ds-svelte-community';
	import {
		ArrowCirclepathIcon,
		ChevronDownIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		ChevronUpIcon,
		CogIcon,
		SkipForwardIcon
	} from '@nais/ds-svelte-community/icons';
	import { onMount, tick, untrack } from 'svelte';
	import LogResults from './LogResults.svelte';
	import LogVolume from './LogVolume.svelte';
	import {
		fetchLogPage,
		fetchLogVolume,
		logDate,
		moveLogRange,
		resolveLogRange,
		toLocalDateTime,
		type LogEntry,
		type LogRange,
		type VolumeBucket
	} from './loki.js';

	let {
		team,
		environment,
		tenant,
		workload,
		instances,
		initialInstance = '',
		initialInstanceIsPrefix = false,
		hasLoki,
		grafanaURL,
		tracesURL
	}: {
		team: string;
		environment: string;
		tenant: string;
		workload: string;
		instances: string[];
		initialInstance?: string;
		initialInstanceIsPrefix?: boolean;
		hasLoki: boolean;
		grafanaURL?: string;
		tracesURL?: string;
	} = $props();

	const id = $props.id();
	const timePresets = [
		{ minutes: 0.25, label: 'Last 15 seconds' },
		{ minutes: 0.5, label: 'Last 30 seconds' },
		{ minutes: 1, label: 'Last minute' },
		{ minutes: 5, label: 'Last 5 minutes' },
		{ minutes: 10, label: 'Last 10 minutes' },
		{ minutes: 15, label: 'Last 15 minutes' },
		{ minutes: 30, label: 'Last 30 minutes' },
		{ minutes: 45, label: 'Last 45 minutes' },
		{ minutes: 60, label: 'Last hour' },
		{ minutes: 180, label: 'Last 3 hours' },
		{ minutes: 360, label: 'Last 6 hours' },
		{ minutes: 720, label: 'Last 12 hours' },
		{ minutes: 1440, label: 'Last 24 hours' },
		{ minutes: 2880, label: 'Last 2 days' },
		{ minutes: 10080, label: 'Last 7 days' }
	];
	let focusedTimeControl = $state<string>();
	let timeRange = $state('15');
	const selectedMinutes = $derived(
		timeRange === 'custom' || timeRange === 'absolute' ? undefined : Number(timeRange)
	);
	let from = $state('');
	let to = $state('');
	let search = $state('');
	let level = $state('');
	let instance = $state(untrack(() => initialInstance));
	const instancePrefix = untrack(() =>
		initialInstanceIsPrefix ? initialInstance.trim() : undefined
	);
	const instanceIsPrefix = $derived(!!instancePrefix && instance.trim() === instancePrefix);
	let labelFilters: LokiLabelFilter[] = $state([]);
	let advanced = $state(false);
	let showQuery = $state(false);
	let showTimeline = $state(true);
	let settingsOpen = $state(false);
	let settingsButton = $state<Element>();
	let logQL = $state('');
	let limit = $state('500');
	let refreshSeconds = $state('0');
	let wrap = $state(true);
	let oldestFirst = $state(false);
	let loading = $state(false);
	let loadingMore = $state(false);
	let error = $state('');
	let volumeError = $state('');
	let warnings: string[] = $state([]);
	let entries: LogEntry[] = $state.raw([]);
	let buckets: VolumeBucket[] = $state.raw([]);
	let nextEnd = $state<string>();
	let active:
		| { query: string; range: LogRange; limit: number; relativeMinutes: number | undefined }
		| undefined = $state.raw();
	let completedAt = $state<Date>();
	let timer: ReturnType<typeof setInterval> | undefined;
	let queryTimer: ReturnType<typeof setTimeout> | undefined;
	let controller: AbortController | undefined;
	let volumeController: AbortController | undefined;
	let requestId = 0;
	const generatedQuery = $derived(
		buildLokiLogQuery({
			team,
			workload,
			container: workload,
			cluster: environmentCluster(environment, tenant),
			instances: instance.trim() && !instanceIsPrefix ? [instance.trim()] : undefined,
			podNamePrefix: instance.trim() && instanceIsPrefix ? instance.trim() : undefined,
			search,
			logLevels: level ? [level] : undefined,
			labelFilters
		})
	);
	const availableInstances = $derived(
		[
			...new Set([
				...instances,
				...entries.map((entry) => entry.labels.k8s_pod_name).filter(Boolean)
			])
		].sort()
	);
	const canShiftPrevious = $derived(
		!!active && BigInt(active.range.start) >= BigInt(active.range.end) - BigInt(active.range.start)
	);
	const canShiftNext = $derived(
		!!active &&
			active.relativeMinutes === undefined &&
			BigInt(active.range.end) + BigInt(active.range.end) - BigInt(active.range.start) <=
				BigInt(Date.now()) * 1_000_000n
	);

	function currentDurationLabel(relative = true) {
		if (!active) return '';
		const milliseconds = Number(
			(BigInt(active.range.end) - BigInt(active.range.start)) / 1_000_000n
		);
		for (const [size, unit] of [
			[3_600_000, 'hour'],
			[60_000, 'minute'],
			[1000, 'second'],
			[1, 'millisecond']
		] as const) {
			if (milliseconds % size === 0) {
				const amount = milliseconds / size;
				const duration = `${amount.toLocaleString()} ${unit}${amount === 1 ? '' : 's'}`;
				return relative ? `Last ${duration}` : `${duration} (fixed)`;
			}
		}
	}

	function dismissTimeTooltip(event: KeyboardEvent) {
		if (event.key === 'Escape') focusedTimeControl = undefined;
	}

	function moveTime(direction: 'previous' | 'next' | 'now') {
		if (!active) return;
		try {
			const range = moveLogRange(active.range, direction);
			const relativeMinutes =
				direction === 'now'
					? Number((BigInt(range.end) - BigInt(range.start)) / 1_000_000n) / 60_000
					: undefined;
			if (relativeMinutes === undefined) absoluteRange(range);
			else timeRange = String(relativeMinutes);
			focusedTimeControl = undefined;
			void run(false, range, relativeMinutes);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Unable to change the time range.';
		}
	}

	async function editQuery() {
		if (!active) return;
		stopScheduledQuery();
		logQL = active.query;
		advanced = true;
		showQuery = true;
		await tick();
		document.getElementById(`${id}-logql`)?.focus();
	}

	async function useFilters() {
		advanced = false;
		scheduleQuery();
		await tick();
		document.getElementById(`${id}-search`)?.focus();
	}

	function filterByLabel(filter: LokiLabelFilter) {
		const next = addLokiLabelFilter(labelFilters, filter);
		if (next === labelFilters) return;
		labelFilters = next;
		scheduleQuery();
	}

	function removeLabelFilter(filter: LokiLabelFilter) {
		labelFilters = labelFilters.filter((candidate) => candidate !== filter);
		scheduleQuery();
	}

	function stopScheduledQuery() {
		clearTimeout(queryTimer);
		queryTimer = undefined;
	}

	function scheduleQuery(delay = 0) {
		stopScheduledQuery();
		if (advanced || !hasLoki) return;
		queryTimer = setTimeout(() => {
			queryTimer = undefined;
			void run();
		}, delay);
	}

	function submitFilter(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.isComposing) {
			event.preventDefault();
			void run();
		}
	}

	async function toggleSettings() {
		settingsOpen = !settingsOpen;
		if (!settingsOpen) return;
		await tick();
		document.getElementById(`${id}-settings`)?.querySelector('select')?.focus();
	}

	function closeSettings() {
		settingsOpen = false;
		if (settingsButton instanceof HTMLElement) settingsButton.focus();
	}

	function handleOutsideClick(event: MouseEvent) {
		if (
			settingsOpen &&
			event.target instanceof Node &&
			!settingsButton?.contains(event.target) &&
			!document.getElementById(`${id}-settings`)?.contains(event.target)
		) {
			settingsOpen = false;
		}
	}

	function stopRefresh() {
		clearInterval(timer);
		timer = undefined;
	}

	function configureRefresh() {
		stopRefresh();
		if (refreshSeconds !== '0') {
			timer = setInterval(
				() => {
					if (!loading && !loadingMore && queryTimer === undefined && !document.hidden)
						void run(true);
				},
				Number(refreshSeconds) * 1000
			);
		}
	}

	function absoluteRange(range: LogRange, edit = false) {
		timeRange = edit ? 'custom' : 'absolute';
		from = toLocalDateTime(logDate(range.start));
		to = toLocalDateTime(logDate(range.end));
	}

	function selectBucket(bucket: VolumeBucket) {
		if (!active) return;
		const start =
			BigInt(Math.round(Math.max(bucket.start, logDate(active.range.start).getTime()))) *
			1_000_000n;
		const end = BigInt(Math.round(bucket.end)) * 1_000_000n;
		const range = { start: String(start), end: String(end) };
		absoluteRange(range);
		if (advanced) void run(false, range);
		else void run();
	}

	function setTimeRange() {
		if (timeRange === 'custom' && !from) {
			absoluteRange(resolveLogRange(15, '', ''), true);
		}
		if (advanced && active && selectedMinutes !== undefined) {
			try {
				const relativeMinutes = Number(timeRange);
				void run(false, resolveLogRange(relativeMinutes, '', ''), relativeMinutes);
			} catch (cause) {
				error = cause instanceof Error ? cause.message : 'Unable to change the time range.';
			}
		} else {
			scheduleQuery();
		}
	}

	async function loadVolume(query: string, range: LogRange, current: number) {
		volumeController?.abort();
		volumeController = new AbortController();
		const signal = volumeController.signal;
		try {
			const result = await fetchLogVolume(query, range, signal);
			if (current !== requestId) return;
			buckets = result.buckets;
			warnings = [...new Set([...warnings, ...result.warnings])];
		} catch (cause) {
			if (signal.aborted || current !== requestId) return;
			volumeError = cause instanceof Error ? cause.message : 'Unable to load log volume.';
		}
	}

	async function run(refresh = false, selectedRange?: LogRange, selectedRelativeMinutes?: number) {
		stopScheduledQuery();
		let next: NonNullable<typeof active>;
		try {
			if ((refresh || selectedRange) && active) {
				next = {
					...active,
					query: selectedRange && !advanced ? generatedQuery : active.query,
					limit: selectedRange ? Number(limit) : active.limit,
					range:
						selectedRange ??
						(active.relativeMinutes === undefined
							? active.range
							: resolveLogRange(active.relativeMinutes, '', '')),
					relativeMinutes: selectedRange ? selectedRelativeMinutes : active.relativeMinutes
				};
			} else {
				const query = advanced ? logQL.trim() : generatedQuery;
				if (!query) throw new Error('Enter a LogQL query.');
				next = {
					query,
					range: resolveLogRange(selectedMinutes, from, to),
					limit: Number(limit),
					relativeMinutes: selectedMinutes
				};
			}
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Unable to run the query.';
			return;
		}

		controller?.abort();
		volumeController?.abort();
		const current = ++requestId;
		controller = new AbortController();
		const signal = controller.signal;
		loading = true;
		loadingMore = false;
		error = '';
		volumeError = '';
		warnings = [];
		entries = [];
		buckets = [];
		nextEnd = undefined;
		completedAt = undefined;
		active = next;
		void loadVolume(next.query, next.range, current);
		try {
			const result = await fetchLogPage({
				...next.range,
				query: next.query,
				limit: next.limit,
				signal
			});
			if (current !== requestId) return;
			entries = result.entries;
			nextEnd = result.nextEnd;
			warnings = [...new Set([...warnings, ...result.warnings])];
			completedAt = new Date();
		} catch (cause) {
			if (signal.aborted || current !== requestId) return;
			error = cause instanceof Error ? cause.message : 'Unable to load logs.';
		} finally {
			if (current === requestId) loading = false;
		}
	}

	async function loadOlder() {
		if (!active || !nextEnd || loading || loadingMore) return;
		controller?.abort();
		controller = new AbortController();
		const signal = controller.signal;
		const current = requestId;
		loadingMore = true;
		error = '';
		try {
			const result = await fetchLogPage({
				...active.range,
				end: nextEnd,
				query: active.query,
				limit: active.limit,
				signal
			});
			if (current !== requestId) return;
			entries = [...entries, ...result.entries];
			nextEnd = result.nextEnd;
			warnings = [...new Set([...warnings, ...result.warnings])];
		} catch (cause) {
			if (signal.aborted || current !== requestId) return;
			error = cause instanceof Error ? cause.message : 'Unable to load older logs.';
		} finally {
			if (current === requestId) loadingMore = false;
		}
	}

	function cancel() {
		stopScheduledQuery();
		++requestId;
		controller?.abort();
		volumeController?.abort();
		loading = false;
		loadingMore = false;
		refreshSeconds = '0';
		stopRefresh();
		error = 'Query cancelled. Refresh to load results again.';
	}

	onMount(() => {
		if (hasLoki) void run();
		return () => {
			++requestId;
			controller?.abort();
			volumeController?.abort();
			stopRefresh();
			stopScheduledQuery();
		};
	});
</script>

<svelte:document onclick={handleOutsideClick} />

{#if !hasLoki}
	<Alert variant="info">This workload has no Loki log destination.</Alert>
{:else}
	<div class="explorer">
		<form
			onsubmit={(event) => {
				event.preventDefault();
				void run();
			}}
			aria-label="Log query"
		>
			<div class="query-toolbar">
				<div class="search-field">
					{#if advanced}
						<span>Advanced LogQL query</span>
					{:else}
						<TextField
							id={`${id}-search`}
							label="Search log content"
							hideLabel
							placeholder="Search log content"
							size="small"
							bind:value={search}
							oninput={() => scheduleQuery(400)}
							onkeydown={submitFilter}
						/>
					{/if}
				</div>
				<div class="time-controls" role="group" aria-label="Time navigation">
					<Tooltip content="Previous time range" open={focusedTimeControl === 'previous'}>
						<Button
							type="button"
							variant="secondary-neutral"
							size="small"
							icon={ChevronLeftIcon}
							aria-label="Previous time range"
							disabled={!canShiftPrevious}
							onclick={() => moveTime('previous')}
							onfocus={() => (focusedTimeControl = 'previous')}
							onblur={() => (focusedTimeControl = undefined)}
							onkeydown={dismissTimeTooltip}
						/>
					</Tooltip>
					<Select
						label="Time range"
						hideLabel
						size="small"
						bind:value={
							() => timeRange,
							(value) => {
								timeRange = value;
								setTimeRange();
							}
						}
					>
						{#each timePresets as preset (preset.minutes)}
							<option value={String(preset.minutes)}>{preset.label}</option>
						{/each}
						{#if active?.relativeMinutes !== undefined && !timePresets.some((preset) => preset.minutes === active?.relativeMinutes)}
							<option value={String(active.relativeMinutes)}>{currentDurationLabel()}</option>
						{/if}
						{#if timeRange === 'absolute'}
							<option value="absolute">{currentDurationLabel(false)}</option>
						{/if}
						<option value="custom">Custom range</option>
					</Select>
					<Tooltip content="Next time range" open={focusedTimeControl === 'next'}>
						<Button
							type="button"
							variant="secondary-neutral"
							size="small"
							icon={ChevronRightIcon}
							aria-label="Next time range"
							disabled={!canShiftNext}
							onclick={() => moveTime('next')}
							onfocus={() => (focusedTimeControl = 'next')}
							onblur={() => (focusedTimeControl = undefined)}
							onkeydown={dismissTimeTooltip}
						/>
					</Tooltip>
					<Tooltip content="Jump to now" open={focusedTimeControl === 'now'}>
						<Button
							type="button"
							variant="secondary-neutral"
							size="small"
							icon={SkipForwardIcon}
							aria-label="Jump to now"
							disabled={!active}
							onclick={() => moveTime('now')}
							onfocus={() => (focusedTimeControl = 'now')}
							onblur={() => (focusedTimeControl = undefined)}
							onkeydown={dismissTimeTooltip}
						/>
					</Tooltip>
				</div>
				<div class="buttons">
					<Button
						type="button"
						variant="secondary"
						size="small"
						icon={ArrowCirclepathIcon}
						aria-label="Refresh"
						disabled={!active || loading || loadingMore}
						onclick={() => run(advanced)}
					/>
					<Button
						type="button"
						variant="tertiary-neutral"
						size="small"
						icon={CogIcon}
						bind:ref={settingsButton}
						aria-expanded={settingsOpen}
						aria-controls={`${id}-settings`}
						aria-haspopup="dialog"
						onclick={toggleSettings}>Settings</Button
					>
					<span
						class={['cancel-slot', { idle: !loading && !loadingMore }]}
						aria-hidden={!loading && !loadingMore}
					>
						<Button
							type="button"
							variant="tertiary"
							size="small"
							disabled={!loading && !loadingMore}
							onclick={cancel}>Cancel</Button
						>
					</span>
				</div>
			</div>
			{#if timeRange === 'custom'}
				<div class="custom-range">
					<TextField
						label="From"
						type="datetime-local"
						size="small"
						step="0.001"
						bind:value={from}
						oninput={() => scheduleQuery(400)}
						required
					/>
					<TextField
						label="To"
						type="datetime-local"
						size="small"
						step="0.001"
						bind:value={to}
						oninput={() => scheduleQuery(400)}
						required
					/>
				</div>
			{/if}
			{#if !advanced}
				<div class="filters">
					<Select
						label="Log level"
						hideLabel
						size="small"
						bind:value={level}
						onchange={() => scheduleQuery()}
					>
						<option value="">All levels</option>
						{#each ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] as name (name)}
							<option value={name}>{name}</option>
						{/each}
					</Select>
					<div class="instance-field">
						<TextField
							label="Instance"
							hideLabel
							placeholder="All instances"
							size="small"
							list={`${id}-instances`}
							bind:value={instance}
							oninput={() => scheduleQuery(400)}
							onkeydown={submitFilter}
						/>
					</div>
					<datalist id={`${id}-instances`}>
						{#each availableInstances as name (name)}<option value={name}></option>{/each}
					</datalist>
				</div>
			{/if}
		</form>

		<Popover
			id={`${id}-settings`}
			role="dialog"
			aria-label="Log settings"
			tabindex={-1}
			anchorEl={settingsButton}
			bind:open={settingsOpen}
			placement="bottom-end"
			onkeydown={(event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					event.preventDefault();
					closeSettings();
				}
			}}
		>
			<div class="settings">
				<Select
					label="Auto-refresh"
					size="small"
					bind:value={
						() => refreshSeconds,
						(value) => {
							refreshSeconds = value;
							configureRefresh();
						}
					}
				>
					<option value="0">Off</option>
					<option value="30">Every 30 seconds</option>
					<option value="60">Every minute</option>
					<option value="300">Every 5 minutes</option>
					<option value="900">Every 15 minutes</option>
				</Select>
				<Select
					label="Lines per page"
					size="small"
					bind:value={limit}
					onchange={() => scheduleQuery()}
				>
					<option value="100">100</option>
					<option value="500">500</option>
					<option value="1000">1000</option>
				</Select>
				<Checkbox size="small" bind:checked={wrap}>Wrap lines</Checkbox>
				<Checkbox size="small" bind:checked={oldestFirst}>Oldest first</Checkbox>
				<Checkbox size="small" bind:checked={showQuery}>Show query</Checkbox>
				{#if grafanaURL}<ExternalLink href={grafanaURL}>Open Grafana</ExternalLink>{/if}
				{#if tracesURL}<ExternalLink href={tracesURL}>Traces</ExternalLink>{/if}
				<p class="context">Browser time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
				<Button type="button" variant="tertiary" size="small" onclick={closeSettings}
					>Close settings</Button
				>
			</div>
		</Popover>

		{#if error}<Alert variant="error">{error}</Alert>{/if}
		{#each warnings as warning (warning)}<Alert variant="warning">{warning}</Alert>{/each}

		{#if active}
			<section aria-labelledby={`${id}-results`} aria-busy={loading || loadingMore}>
				<Heading as="h2" size="small" class="aksel-sr-only" id={`${id}-results`}
					>Query results</Heading
				>
				{#if !advanced && labelFilters.length > 0}
					<div class="active-label-filters">
						<Chips size="small" aria-label="Active label filters">
							{#each labelFilters as filter (`${filter.name}${filter.operator}${JSON.stringify(filter.value)}`)}
								<li>
									<RemovableChip
										value={`${filter.name}${filter.operator}${JSON.stringify(filter.value)}`}
										removeLabel="Remove filter"
										ondelete={() => removeLabelFilter(filter)}
									/>
								</li>
							{/each}
						</Chips>
					</div>
				{/if}
				{#if showQuery}
					<div class="executed-query">
						<details class="query-preview">
							<summary>Executed LogQL</summary>
							<pre>{active.query}</pre>
						</details>
						{#if advanced}
							<form
								aria-label="LogQL editor"
								onsubmit={(event) => {
									event.preventDefault();
									void run();
								}}
							>
								<Textarea
									id={`${id}-logql`}
									label="LogQL"
									description="Filter controls do not apply in LogQL mode. Keep the cluster, team and workload selectors to stay within this workload."
									size="small"
									rows={3}
									bind:value={logQL}
								/>
								<div class="buttons">
									<Button type="submit" size="small">Run query</Button>
									<Button type="button" variant="tertiary" size="small" onclick={useFilters}>
										Use filters
									</Button>
								</div>
							</form>
						{:else}
							<div class="buttons">
								<Button type="button" variant="tertiary" size="small" onclick={editQuery}>
									Edit query
								</Button>
							</div>
						{/if}
					</div>
				{/if}
				{#if volumeError}
					<Alert variant="warning">Log volume is unavailable: {volumeError}</Alert>
				{/if}
				<div class="timeline-header">
					<Button
						type="button"
						variant="tertiary-neutral"
						size="xsmall"
						icon={showTimeline ? ChevronUpIcon : ChevronDownIcon}
						iconPosition="right"
						aria-expanded={showTimeline}
						aria-controls={`${id}-timeline`}
						onclick={() => (showTimeline = !showTimeline)}>Timeline</Button
					>
					{#if refreshSeconds !== '0'}<span class="context">Auto-refresh: {refreshSeconds}s</span
						>{/if}
				</div>
				<div id={`${id}-timeline`} hidden={!showTimeline}>
					{#if buckets.length > 0}
						<ChartBoundary fillHeight={false}>
							<LogVolume {buckets} onselect={selectBucket} />
						</ChartBoundary>
					{/if}
				</div>
				<div class="result-status">
					<p role="status" class="context">
						{#if loading}
							Running query…
						{:else if completedAt}
							{entries.length.toLocaleString()} lines loaded · Updated {completedAt.toLocaleTimeString()}
							{#if nextEnd}
								· More results may be available.{/if}
						{/if}
					</p>
					<p class="context">
						{logDate(active.range.start).toLocaleString()} – {logDate(
							active.range.end
						).toLocaleString()}
					</p>
				</div>
				{#if !loading && completedAt && entries.length === 0}
					<Alert variant="info">No logs match this query and time range.</Alert>
				{:else if entries.length > 0}
					<LogResults
						{entries}
						{wrap}
						{oldestFirst}
						onfilter={advanced ? undefined : filterByLabel}
					/>
				{/if}
			</section>
			{#if nextEnd}
				<div class="older">
					<Button
						variant="secondary"
						size="small"
						loading={loadingMore}
						disabled={loading}
						onclick={loadOlder}>Load older logs</Button
					>
					{#if refreshSeconds !== '0'}<p>
							Auto-refresh replaces loaded pages with the latest query results.
						</p>{/if}
				</div>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.explorer,
	form,
	.settings {
		display: grid;
		gap: var(--ax-space-8);
		min-width: 0;
	}

	.explorer {
		grid-template-columns: minmax(0, 1fr);
	}

	.query-toolbar,
	.time-controls,
	.custom-range,
	.filters,
	.buttons,
	.timeline-header,
	.result-status {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
		align-items: center;
	}

	.search-field {
		flex: 1;
		min-width: 0;
	}

	.cancel-slot {
		display: inline-flex;
	}

	.cancel-slot.idle {
		visibility: hidden;
	}

	.time-controls {
		gap: var(--ax-space-2);
		max-width: 100%;
	}

	.instance-field {
		width: min(100%, calc(var(--ax-space-64) * 4));
		min-width: 0;
	}

	.timeline-header,
	.result-status {
		justify-content: space-between;
	}

	.result-status {
		margin-block: var(--ax-space-8);
	}

	.settings {
		max-width: min(calc(var(--ax-space-64) * 4), calc(100vw - var(--ax-space-16) * 2));
	}

	.context {
		margin: 0;
		font-size: var(--ax-font-size-small);
		overflow-wrap: anywhere;
	}

	.query-preview {
		margin-block: var(--ax-space-8);
	}

	.executed-query {
		display: grid;
		gap: var(--ax-space-16);
		min-width: 0;
		margin-block-end: var(--ax-space-24);
	}

	.executed-query form {
		gap: var(--ax-space-16);
	}

	.query-preview summary {
		cursor: pointer;
	}

	.active-label-filters li {
		min-width: 0;
		max-width: 100%;
		list-style: none;
	}

	.active-label-filters :global(.aksel-chips__chip) {
		max-width: 100%;
		height: auto;
		white-space: normal;
	}

	.active-label-filters :global(.aksel-chips__chip-text) {
		overflow-wrap: anywhere;
	}

	pre {
		font-size: var(--ax-font-size-small);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.older {
		display: grid;
		justify-items: center;
		gap: var(--ax-space-8);
	}

	@media (max-width: 767px) {
		.search-field {
			flex-basis: 100%;
		}

		.filters,
		.query-toolbar {
			align-items: center;
		}

		.instance-field {
			flex: 1;
		}
	}
</style>
