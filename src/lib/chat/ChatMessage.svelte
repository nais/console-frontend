<script lang="ts">
	import { Loader } from '@nais/ds-svelte-community';
	import type { ChatMessage } from './chatService.svelte';

	interface Props {
		message: ChatMessage;
	}

	let { message }: Props = $props();
</script>

<div
	class="message"
	class:user={message.role === 'user'}
	class:assistant={message.role === 'assistant'}
>
	<div class="message-bubble">
		{#if message.toolsUsed && message.toolsUsed.length > 0}
			<div class="tools-used">
				{#each message.toolsUsed as tool (tool.name)}
					<div class="tool-badge">
						<span class="tool-icon">🔧</span>
						<span class="tool-name">{tool.name}</span>
					</div>
				{/each}
			</div>
		{/if}

		<div class="message-content">
			{message.content}
			{#if message.isStreaming && !message.content}
				<Loader size="xsmall" />
			{/if}
			{#if message.isStreaming && message.content}
				<span class="cursor">▋</span>
			{/if}
		</div>

		{#if message.sources && message.sources.length > 0}
			<div class="sources">
				<span class="sources-label">Sources:</span>
				<ul class="sources-list">
					{#each message.sources as source (source.url)}
						<li>
							<a href={source.url} target="_blank" rel="noopener noreferrer">
								{source.title}
							</a>
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
		margin-bottom: var(--ax-space-12);
	}

	.message.user {
		justify-content: flex-end;
	}

	.message.assistant {
		justify-content: flex-start;
	}

	.message-bubble {
		max-width: 85%;
		padding: var(--ax-space-12) var(--ax-space-16);
		border-radius: var(--ax-border-radius-large);
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.message.user .message-bubble {
		background-color: var(--ax-bg-action-selected);
		color: var(--ax-text-on-action);
	}

	.message.assistant .message-bubble {
		background-color: var(--ax-bg-subtle);
		color: var(--ax-text-default);
	}

	.message-content {
		font-size: var(--ax-font-size-medium);
		line-height: var(--ax-font-line-height-medium);
		white-space: pre-wrap;
	}

	.cursor {
		animation: blink 1s infinite;
		opacity: 0.7;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 0.7;
		}
		51%,
		100% {
			opacity: 0;
		}
	}

	.tools-used {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-4);
		margin-bottom: var(--ax-space-8);
	}

	.tool-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
		padding: var(--ax-space-2) var(--ax-space-8);
		background-color: var(--ax-bg-default);
		border: 1px solid var(--ax-border-default);
		border-radius: var(--ax-border-radius-small);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}

	.tool-icon {
		font-size: var(--ax-font-size-small);
	}

	.tool-name {
		font-family: var(--ax-font-family-mono, monospace);
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
</style>
