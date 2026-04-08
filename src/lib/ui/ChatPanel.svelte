<script lang="ts">
	import ChatInput from '$lib/chat/ChatInput.svelte';
	import ChatMessage from '$lib/chat/ChatMessage.svelte';
	import ChatPanelHeader from '$lib/chat/ChatPanelHeader.svelte';
	import { chatService } from '$lib/chat/chatService.svelte';
	import ChatWelcome from '$lib/chat/ChatWelcome.svelte';
	import ConversationHistory from '$lib/chat/ConversationHistory.svelte';
	import { chatPanel } from '$lib/stores/chatPanel.svelte';
	import { tick } from 'svelte';

	let isResizing = $state(false);
	let messagesContainer: HTMLDivElement | undefined = $state();

	function startResize(event: MouseEvent) {
		event.preventDefault();
		isResizing = true;

		const startX = event.clientX;
		const startWidth = chatPanel.width;

		function onMouseMove(moveEvent: MouseEvent) {
			const delta = startX - moveEvent.clientX;
			chatPanel.setWidth(startWidth + delta);
		}

		function onMouseUp() {
			isResizing = false;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	function handleResizeKeyDown(event: KeyboardEvent) {
		const step = event.shiftKey ? 48 : 16;

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			chatPanel.setWidth(chatPanel.width + step);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			chatPanel.setWidth(chatPanel.width - step);
		}
	}

	function closePanel() {
		chatPanel.close();
	}

	function handleNewChat() {
		chatService.newConversation();
	}

	function handleToggleHistory() {
		chatService.toggleHistory();
	}

	async function handleSendMessage(message: string) {
		await chatService.sendMessage(message);
		await scrollToBottom();
	}

	async function scrollToBottom() {
		await tick();
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	$effect(() => {
		if (chatService.messages.length > 0 && !chatService.showHistory) {
			scrollToBottom();
		}
	});

	const panelTitle = $derived(chatService.showHistory ? 'Conversation history' : 'Assistant');

	const panelSubtitle = $derived.by(() => {
		if (chatService.showHistory) {
			return 'Browse and reopen previous conversations';
		}

		if (chatService.currentToolName) {
			return `Using ${chatService.currentToolName}`;
		}

		if (chatService.isLoading) {
			return 'Thinking…';
		}

		return 'Ask about your apps, teams and the Nais platform';
	});
</script>

{#if chatPanel.isOpen}
	<aside
		class="chat-panel"
		class:resizing={isResizing}
		style:width="{chatPanel.width}px"
		aria-label="Assistant panel"
	>
		<button
			type="button"
			class="resize-handle"
			onmousedown={startResize}
			onkeydown={handleResizeKeyDown}
			aria-label="Resize assistant panel"
		></button>

		<div class="panel-shell">
			<div class="panel-content">
				<ChatPanelHeader
					title={panelTitle}
					subtitle={panelSubtitle}
					showHistory={chatService.showHistory}
					canStartNew={chatService.hasMessages}
					onToggleHistory={handleToggleHistory}
					onNewChat={handleNewChat}
					onClose={closePanel}
				/>

				{#if chatService.error}
					<div class="error-banner" role="alert">
						{chatService.error}
					</div>
				{/if}

				<div class="chat-body">
					{#if chatService.showHistory}
						<ConversationHistory />
					{:else if chatService.hasMessages}
						<div class="messages-container" bind:this={messagesContainer}>
							{#each chatService.messages as message (message.id)}
								<ChatMessage {message} />
							{/each}
						</div>
					{:else}
						<ChatWelcome />
					{/if}
				</div>

				{#if !chatService.showHistory}
					<div class="input-shell">
						<ChatInput onSend={handleSendMessage} disabled={chatService.isLoading} />
					</div>
				{/if}
			</div>
		</div>
	</aside>
{/if}

<style>
	.chat-panel {
		position: fixed;
		inset-block: 0;
		inset-inline-end: 0;
		display: flex;
		height: 100vh;
		background: var(--ax-bg-default);
		border-inline-start: 1px solid var(--ax-border-neutral-subtle);
		z-index: 100;
	}

	.chat-panel.resizing {
		user-select: none;
	}

	.resize-handle {
		position: absolute;
		inset-inline-start: 0;
		inset-block: 0;
		width: 0.5rem;
		padding: 0;
		border: 0;
		cursor: ew-resize;
		background:
			linear-gradient(
				to right,
				var(--ax-border-neutral-subtle) 0,
				var(--ax-border-neutral-subtle) 1px,
				transparent 1px,
				transparent 100%
			),
			transparent;
		transition: background-color 120ms ease;
	}

	.resize-handle:hover,
	.chat-panel.resizing .resize-handle,
	.resize-handle:focus-visible {
		background-color: var(--ax-bg-neutral-soft);
		outline: none;
	}

	.panel-shell {
		display: flex;
		flex: 1;
		background: var(--ax-bg-default);
	}

	.panel-content {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
		height: 100%;
		overflow: hidden;
		background: var(--ax-bg-default);
	}

	.chat-body {
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
		background: var(--ax-bg-default);
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		padding: var(--ax-space-16);
		scroll-padding-block-end: var(--ax-space-16);
	}

	.input-shell {
		border-block-start: 1px solid var(--ax-border-neutral-subtle);
		background: var(--ax-bg-default);
	}

	.error-banner {
		padding: var(--ax-space-12) var(--ax-space-16);
		border-block-end: 1px solid var(--ax-border-danger-strong);
		background: var(--ax-bg-danger-strong);
		color: var(--ax-text-danger);
		font-size: var(--ax-font-size-small);
		line-height: var(--ax-font-line-height-medium);
	}

	@media (max-width: 48rem) {
		.chat-panel {
			inset: 0;
			width: 100% !important;
			border-inline-start: none;
			box-shadow: none;
		}

		.resize-handle {
			display: none;
		}

		.panel-shell {
			padding: 0;
		}

		.panel-content {
			border: none;
			border-radius: 0;
			box-shadow: none;
		}

		.messages-container {
			padding: var(--ax-space-12);
		}
	}
</style>
