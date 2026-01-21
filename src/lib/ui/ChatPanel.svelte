<script lang="ts">
	import ChatInput from '$lib/chat/ChatInput.svelte';
	import ChatMessage from '$lib/chat/ChatMessage.svelte';
	import { chatService } from '$lib/chat/chatService.svelte';
	import ChatWelcome from '$lib/chat/ChatWelcome.svelte';
	import { chatPanel } from '$lib/stores/chatPanel.svelte';
	import { XMarkIcon } from '@nais/ds-svelte-community/icons';
	import { tick } from 'svelte';

	let isResizing = $state(false);
	let messagesContainer: HTMLDivElement | undefined = $state();

	function startResize(e: MouseEvent) {
		e.preventDefault();
		isResizing = true;

		const startX = e.clientX;
		const startWidth = chatPanel.width;

		function onMouseMove(e: MouseEvent) {
			const delta = startX - e.clientX;
			const newWidth = startWidth + delta;
			chatPanel.setWidth(newWidth);
		}

		function onMouseUp() {
			isResizing = false;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	function handleKeyDown(e: KeyboardEvent) {
		const step = e.shiftKey ? 50 : 10;
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			chatPanel.setWidth(chatPanel.width + step);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			chatPanel.setWidth(chatPanel.width - step);
		}
	}

	function closePanel() {
		chatPanel.close();
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

	// Auto-scroll when messages change
	$effect(() => {
		if (chatService.messages.length > 0) {
			scrollToBottom();
		}
	});
</script>

{#if chatPanel.isOpen}
	<aside
		class="chat-panel"
		class:resizing={isResizing}
		style:width="{chatPanel.width}px"
		aria-label="Chat panel"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="resize-handle"
			onmousedown={startResize}
			onkeydown={handleKeyDown}
			role="separator"
			aria-orientation="vertical"
			aria-valuenow={chatPanel.width}
			aria-valuemin={chatPanel.minWidth}
			aria-valuemax={chatPanel.maxWidth}
			aria-label="Resize chat panel"
			tabindex="0"
		></div>
		<div class="panel-content">
			<header class="panel-header">
				<h2>Chat</h2>
				<button class="close-button" onclick={closePanel} aria-label="Close chat panel">
					<XMarkIcon aria-hidden="true" />
				</button>
			</header>

			<div class="chat-body">
				{#if chatService.hasMessages}
					<div class="messages-container" bind:this={messagesContainer}>
						{#each chatService.messages as message (message.id)}
							<ChatMessage {message} />
						{/each}
					</div>
				{:else}
					<ChatWelcome />
				{/if}
			</div>

			<ChatInput onSend={handleSendMessage} disabled={chatService.isLoading} />
		</div>
	</aside>
{/if}

<style>
	.chat-panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: var(--ax-bg-default);
		border-left: 1px solid var(--ax-border-default);
		display: flex;
		z-index: 100;
		box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
	}

	.chat-panel.resizing {
		user-select: none;
	}

	/* Mobile: fullscreen overlay */
	@media (max-width: 768px) {
		.chat-panel {
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			width: 100% !important;
			border-left: none;
			box-shadow: none;
		}

		.resize-handle {
			display: none;
		}

		.panel-content {
			padding-left: 0;
		}
	}

	.resize-handle {
		position: absolute;
		left: 0;
		top: 0;
		width: 6px;
		height: 100%;
		cursor: ew-resize;
		background: transparent;
		transition: background-color 0.15s ease;
	}

	.resize-handle:hover,
	.chat-panel.resizing .resize-handle {
		background-color: var(--ax-border-action);
	}

	.panel-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;
		padding-left: 6px;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--ax-space-16);
		border-bottom: 1px solid var(--ax-border-default);
		flex-shrink: 0;
	}

	.panel-header h2 {
		margin: 0;
		font-size: var(--ax-font-size-large);
		font-weight: var(--ax-font-weight-semibold);
	}

	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: none;
		background: transparent;
		border-radius: var(--ax-border-radius-medium);
		cursor: pointer;
		color: var(--ax-text-default);
	}

	.close-button:hover {
		background-color: var(--ax-bg-hover);
	}

	.chat-body {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		padding: var(--ax-space-16);
	}
</style>
