<script lang="ts">
	import PrometheusChart from '$lib/chart/PrometheusChart.svelte';
	import { PrometheusChartQueryInterval } from '$lib/chart/util';
	import ChatMarkdown from './ChatMarkdown.svelte';
	import type { ChatMessage, ContentBlock } from './chatService.svelte';
	import Muscox from './Muscox.svelte';

	interface Props {
		message: ChatMessage;
	}

	let { message }: Props = $props();

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('nb-NO', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Deduplicate sources by URL
	function uniqueSources(
		sources: { title: string; url: string }[]
	): { title: string; url: string }[] {
		const seen: Record<string, boolean> = {};
		return sources.filter((source) => {
			if (seen[source.url]) return false;
			seen[source.url] = true;
			return true;
		});
	}

	// Convert API interval string to PrometheusChartQueryInterval
	function mapInterval(
		interval?: string
	): (typeof PrometheusChartQueryInterval)[keyof typeof PrometheusChartQueryInterval] {
		switch (interval) {
			case '1h':
				return PrometheusChartQueryInterval.OneHour;
			case '6h':
				return PrometheusChartQueryInterval.SixHours;
			case '1d':
				return PrometheusChartQueryInterval.OneDay;
			case '7d':
				return PrometheusChartQueryInterval.SevenDays;
			case '30d':
				return PrometheusChartQueryInterval.ThirtyDays;
			default:
				return PrometheusChartQueryInterval.OneHour;
		}
	}

	// Create label formatter from template like "{pod}" or "{pod}/{container}"
	function createLabelFormatter(
		template?: string
	): (labels: { name: string; value: string }[]) => string {
		if (!template) {
			return (labels) => labels.map((l) => l.value).join('/');
		}
		return (labels) => {
			let result = template;
			for (const label of labels) {
				result = result.replace(`{${label.name}}`, label.value);
			}
			return result;
		};
	}

	// Format bytes to human readable
	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		const value = bytes / Math.pow(1024, i);
		return `${value.toFixed(value < 10 ? 2 : 1)} ${units[i]}`;
	}

	// Format duration in seconds to human readable
	function formatDuration(seconds: number): string {
		if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
		if (seconds < 60) return `${seconds.toFixed(1)}s`;
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${mins}m`;
	}

	// Create Y-axis formatter based on format type
	function createYValueFormatter(format?: string): (value: number) => string {
		switch (format) {
			case 'percentage':
				return (value) => `${(value * 100).toFixed(1)}%`;
			case 'bytes':
				return formatBytes;
			case 'cpu_cores':
				return (value) =>
					value < 1 ? `${(value * 1000).toFixed(0)}m` : `${value.toFixed(2)} cores`;
			case 'duration':
				return formatDuration;
			default:
				return (value) => (value % 1 !== 0 ? value.toFixed(2) : value.toLocaleString());
		}
	}

	// Generate stable key for each block
	function blockKey(block: ContentBlock, index: number): string {
		switch (block.type) {
			case 'thinking':
				return `thinking-${index}`;
			case 'text':
				return `text-${index}`;
			case 'tool_use':
				return `tool-${block.tool_call_id}-${index}`;
			case 'chart':
				return `chart-${block.chart.query}-${index}`;
		}
	}

	// Format token count for display
	function formatTokens(count?: number): string {
		if (count === undefined) return '?';
		if (count >= 1000) {
			return `${(count / 1000).toFixed(1)}k`;
		}
		return count.toString();
	}
</script>

<div
	class="message"
	class:user={message.role === 'user'}
	class:assistant={message.role === 'assistant'}
>
	<div class="message-header">
		<span class="sender">{message.role === 'user' ? 'You' : 'Nais Assistant'}</span>
		<span class="timestamp">{formatTime(message.timestamp)}</span>
	</div>

	<div class="message-body">
		{#each message.blocks as block, i (blockKey(block, i))}
			{#if block.type === 'thinking'}
				{@const thinkingTitle = block.thinking.match(/^\*\*(.+?)\*\*/)?.[1]}
				{@const thinkingBody = block.thinking.replace(/^\*\*.+?\*\*\n*/, '').trim()}
				<details class="thinking">
					<summary class="thinking-summary">
						<span class="thinking-chevron" aria-hidden="true">›</span>
						<span class="thinking-title">{thinkingTitle ?? 'Thinking'}</span>
					</summary>
					<div class="thinking-content">{thinkingBody}</div>
				</details>
			{:else if block.type === 'tool_use'}
				<div class="tool-badge" class:tool-failed={!block.tool_success}>
					<span class="tool-icon">{block.tool_success ? '🔧' : '❌'}</span>
					<span class="tool-name">{block.tool_name}</span>
				</div>
			{:else if block.type === 'text'}
				<div class="text-block">
					{#if message.role === 'assistant'}
						<ChatMarkdown content={block.text} />
					{:else}
						<span class="user-text">{block.text}</span>
					{/if}
				</div>
			{:else if block.type === 'chart'}
				<div class="chart-container">
					<h4 class="chart-title">{block.chart.title}</h4>
					<PrometheusChart
						environmentName={block.chart.environment}
						query={block.chart.query}
						height="250px"
						interval={mapInterval(block.chart.interval)}
						labelFormatter={createLabelFormatter(block.chart.label_template)}
						formatYValue={createYValueFormatter(block.chart.y_format)}
					/>
				</div>
			{/if}
		{/each}

		{#if message.isStreaming}
			<span class="streaming-indicator"><Muscox size="1em" /></span>
		{/if}

		{#if message.sources && message.sources.length > 0}
			{@const dedupedSources = uniqueSources(message.sources)}
			<div class="sources">
				<span class="sources-label">Sources:</span>
				<ul class="sources-list">
					{#each dedupedSources as source (source.url)}
						<li>
							<a href={source.url} target="_blank" rel="noopener noreferrer">
								{source.title}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if message.usage}
			<div class="usage">
				<span class="usage-label">Tokens:</span>
				<span class="usage-value">{formatTokens(message.usage.input_tokens)} in</span>
				<span class="usage-separator">·</span>
				<span class="usage-value">{formatTokens(message.usage.output_tokens)} out</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.message {
		display: flex;
		flex-direction: column;
		margin-bottom: var(--ax-space-16);
		padding: var(--ax-space-12);
		border-radius: var(--ax-border-radius-large);
	}

	.message.user {
		background-color: var(--ax-bg-action-subtle);
		margin-left: var(--ax-space-24);
	}

	.message.assistant {
		background-color: var(--ax-bg-subtle);
		margin-right: var(--ax-space-24);
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--ax-space-8);
	}

	.sender {
		font-weight: var(--ax-font-weight-semibold);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}

	.message.user .sender {
		color: var(--ax-text-action);
	}

	.message.assistant .sender {
		color: var(--ax-text-subtle);
	}

	.timestamp {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}

	.message-body {
		font-size: var(--ax-font-size-medium);
		line-height: var(--ax-font-line-height-medium);
	}

	.text-block {
		color: var(--ax-text-neutral);
	}

	.user-text {
		white-space: pre-wrap;
	}

	.streaming-indicator {
		display: inline-block;
		margin-left: var(--ax-space-4);
	}

	.tool-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
		padding: var(--ax-space-2) var(--ax-space-8);
		margin: var(--ax-space-4) var(--ax-space-4) var(--ax-space-4) 0;
		background-color: var(--ax-bg-default);
		border: 1px solid var(--ax-border-default);
		border-radius: var(--ax-border-radius-small);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}

	.tool-badge.tool-failed {
		border-color: var(--ax-border-danger);
		background-color: var(--ax-bg-danger-subtle);
	}

	.tool-icon {
		font-size: var(--ax-font-size-small);
	}

	.tool-name {
		font-family: var(--ax-font-family-mono, monospace);
	}

	.thinking {
		margin: var(--ax-space-8) 0;
	}

	.thinking-summary {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
		list-style: none;
		cursor: pointer;
		user-select: none;
		width: fit-content;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}

	.thinking-summary::-webkit-details-marker {
		display: none;
	}

	.thinking-chevron {
		font-size: 1rem;
		line-height: 1;
		transition: rotate 0.15s ease;
	}

	:global(details[open]) .thinking-chevron {
		rotate: 90deg;
	}

	.thinking-title {
		font-style: italic;
	}

	.thinking-summary:hover .thinking-title {
		color: var(--ax-text-neutral);
	}

	.thinking-content {
		margin-top: var(--ax-space-6);
		padding: var(--ax-space-8);
		background-color: var(--ax-bg-sunken);
		border-radius: var(--ax-border-radius-small);
		border-left: 3px solid var(--ax-border-action);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
		white-space: pre-wrap;
	}

	.chart-container {
		margin: var(--ax-space-12) 0;
		padding: var(--ax-space-12);
		background-color: var(--ax-bg-default);
		border: 1px solid var(--ax-border-subtle);
		border-radius: var(--ax-border-radius-medium);
	}

	.chart-title {
		margin: 0 0 var(--ax-space-8) 0;
		font-size: var(--ax-font-size-medium);
		font-weight: var(--ax-font-weight-semibold);
		color: var(--ax-text-neutral);
	}

	.sources {
		margin-top: var(--ax-space-12);
		padding-top: var(--ax-space-8);
		border-top: 1px solid var(--ax-border-subtle);
	}

	.sources-label {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-semibold);
		color: var(--ax-text-subtle);
	}

	.sources-list {
		margin: var(--ax-space-4) 0 0 0;
		padding-left: var(--ax-space-16);
		font-size: var(--ax-font-size-small);
	}

	.sources-list li {
		margin-bottom: var(--ax-space-2);
	}

	.sources-list a {
		color: var(--ax-text-action);
		text-decoration: none;
	}

	.sources-list a:hover {
		text-decoration: underline;
	}

	.usage {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
		margin-top: var(--ax-space-8);
		padding-top: var(--ax-space-8);
		border-top: 1px solid var(--ax-border-subtle);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}

	.usage-label {
		font-weight: var(--ax-font-weight-semibold);
	}

	.usage-separator {
		color: var(--ax-text-subtle);
	}
</style>
