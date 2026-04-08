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

	function uniqueSources(
		sources: { title: string; url: string }[]
	): { title: string; url: string }[] {
		return Array.from(new Map(sources.map((source) => [source.url, source])).values());
	}

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

	function createLabelFormatter(
		template?: string
	): (labels: { name: string; value: string }[]) => string {
		if (!template) {
			return (labels) => labels.map((label) => label.value).join('/');
		}

		return (labels) => {
			let result = template;
			for (const label of labels) {
				result = result.replace(`{${label.name}}`, label.value);
			}
			return result;
		};
	}

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		const value = bytes / Math.pow(1024, i);
		return `${value.toFixed(value < 10 ? 2 : 1)} ${units[i]}`;
	}

	function formatDuration(seconds: number): string {
		if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
		if (seconds < 60) return `${seconds.toFixed(1)}s`;
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${mins}m`;
	}

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
</script>

<div
	class="message"
	class:user={message.role === 'user'}
	class:assistant={message.role === 'assistant'}
>
	<div class="message-meta">
		<span class="sender">{message.role === 'user' ? 'You' : 'Nais assistant'}</span>
		<span class="timestamp">{formatTime(message.timestamp)}</span>
	</div>

	<div class="message-content">
		{#each message.blocks as block, i (blockKey(block, i))}
			{#if block.type === 'thinking'}
				{@const thinkingTitle = block.thinking.match(/^\*\*(.+?)\*\*/)?.[1]}
				{@const thinkingBody = block.thinking.replace(/^\*\*.+?\*\*\n*/, '').trim()}
				<details class="thinking">
					<summary class="thinking-summary">
						<span class="thinking-label">{thinkingTitle ?? 'Reasoning'}</span>
					</summary>
					<div class="thinking-content">{thinkingBody}</div>
				</details>
			{:else if block.type === 'tool_use'}
				<div class="tool-status" class:tool-failed={!block.tool_success}>
					<span class="tool-name">{block.tool_name}</span>
					<span class="tool-result">{block.tool_success ? 'completed' : 'failed'}</span>
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
			<div class="streaming-status" aria-live="polite">
				<Muscox size="1em" />
				<span>Writing…</span>
			</div>
		{/if}

		{#if message.sources && message.sources.length > 0}
			{@const dedupedSources = uniqueSources(message.sources)}
			<div class="sources">
				<span class="sources-label">Sources</span>
				<ul class="sources-list">
					{#each dedupedSources as source (source.url)}
						<li>
							<a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>

<style>
	.message {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		margin-bottom: var(--ax-space-24);
	}

	.message.user {
		align-items: flex-end;
	}

	.message.assistant {
		align-items: flex-start;
	}

	.message-meta {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}

	.message.user .message-meta {
		padding-right: var(--ax-space-4);
	}

	.sender {
		font-weight: var(--ax-font-weight-bold);
	}

	.timestamp {
		color: var(--ax-text-subtle);
	}

	.message-content {
		width: 100%;
		max-width: 100%;
	}

	.message.user .message-content {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.message.assistant .message-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.text-block {
		max-width: min(100%, 42rem);
	}

	.message.user .text-block {
		padding: var(--ax-space-12) var(--ax-space-16);
		border-radius: var(--ax-border-radius-medium);
		background-color: var(--ax-bg-info-soft);
		color: var(--ax-text-default);
	}

	.message.assistant .text-block {
		padding: var(--ax-space-12) var(--ax-space-16);
		border: 1px solid var(--ax-border-neutral-subtle);
		border-radius: var(--ax-border-radius-medium);
		background-color: var(--ax-bg-default);
		color: var(--ax-text-default);
	}

	.user-text {
		white-space: pre-wrap;
		word-break: break-word;
	}

	.streaming-status {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-8);
		margin-top: var(--ax-space-8);
		padding-inline: var(--ax-space-4);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}

	.thinking {
		margin-top: var(--ax-space-8);
		max-width: min(100%, 42rem);
	}

	.thinking-summary {
		cursor: pointer;
		list-style: none;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}

	.thinking-summary::-webkit-details-marker {
		display: none;
	}

	.thinking-label {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-4) 0;
		border-bottom: 1px dashed var(--ax-border-neutral-subtle);
	}

	.thinking-content {
		margin-top: var(--ax-space-8);
		padding: var(--ax-space-12);
		border-radius: var(--ax-border-radius-medium);
		background-color: var(--ax-bg-neutral-soft);
		color: var(--ax-text-subtle);
		font-size: var(--ax-font-size-small);
		white-space: pre-wrap;
	}

	.tool-status {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-8);
		margin-top: var(--ax-space-8);
		padding: var(--ax-space-4) var(--ax-space-8);
		border-radius: var(--ax-border-radius-small);
		background-color: var(--ax-bg-neutral-soft);
		color: var(--ax-text-subtle);
		font-size: var(--ax-font-size-small);
	}

	.tool-status.tool-failed {
		background-color: var(--ax-bg-danger-strong);
		color: var(--ax-text-danger);
	}

	.tool-name {
		font-family: monospace;
	}

	.tool-result {
		color: inherit;
	}

	.chart-container {
		width: min(100%, 42rem);
		margin-top: var(--ax-space-12);
		padding: var(--ax-space-16);
		border: 1px solid var(--ax-border-neutral-subtle);
		border-radius: var(--ax-border-radius-medium);
		background-color: var(--ax-bg-default);
	}

	.chart-title {
		margin: 0 0 var(--ax-space-12) 0;
		font-size: var(--ax-font-size-medium);
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-default);
	}

	.sources {
		margin-top: var(--ax-space-8);
		max-width: min(100%, 42rem);
		padding: var(--ax-space-8) var(--ax-space-12);
		border: 1px solid var(--ax-border-neutral-subtle);
		border-radius: var(--ax-border-radius-medium);
		background-color: var(--ax-bg-default);
	}

	.sources-label {
		display: block;
		margin-bottom: var(--ax-space-2);
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-subtle);
	}

	.sources-list {
		margin: 0;
		padding-left: var(--ax-space-12);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}

	.sources-list li + li {
		margin-top: var(--ax-space-2);
	}

	.sources-list a {
		color: var(--ax-text-default);
		text-decoration: none;
	}

	.sources-list a:hover {
		text-decoration: underline;
	}
</style>
