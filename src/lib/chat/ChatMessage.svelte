<script lang="ts">
	import { Loader } from '@nais/ds-svelte-community';
	import type { ChatMessage } from './chatService.svelte';

	interface Props {
		message: ChatMessage;
	}

	let { message }: Props = $props();
</script>

<div class="message" class:user={message.role === 'user'} class:assistant={message.role === 'assistant'}>
	<div class="message-bubble">
		<div class="message-content">
			{message.content}
			{#if message.isStreaming && !message.content}
				<Loader size="xsmall" />
			{/if}
			{#if message.isStreaming && message.content}
				<span class="cursor">▋</span>
			{/if}
		</div>
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
</style>
