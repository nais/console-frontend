<script lang="ts">
	import { chatService, type ConversationSummary } from './chatService.svelte';
	import { Button, Loader } from '@nais/ds-svelte-community';
	import { TrashIcon } from '@nais/ds-svelte-community/icons';

	function formatDate(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
		} else if (diffDays === 1) {
			return 'Yesterday';
		} else if (diffDays < 7) {
			return date.toLocaleDateString(undefined, { weekday: 'long' });
		} else {
			return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
		}
	}

	async function handleSelectConversation(conversation: ConversationSummary) {
		await chatService.loadConversation(conversation.id);
	}

	async function handleDeleteConversation(e: MouseEvent, conversationId: string) {
		e.stopPropagation();
		await chatService.deleteConversation(conversationId);
	}

	function handleBack() {
		chatService.showHistory = false;
	}
</script>

<div class="history-container">
	<div class="history-header">
		<button class="back-button" onclick={handleBack} aria-label="Back to chat"> ← Back </button>
		<h3>Conversation History</h3>
	</div>

	{#if chatService.isLoadingConversations}
		<div class="loading-state">
			<Loader size="medium" />
			<span>Loading conversations...</span>
		</div>
	{:else if chatService.conversationsError}
		<div class="error-state">
			<p>{chatService.conversationsError}</p>
			<Button variant="secondary" size="small" onclick={() => chatService.fetchConversations()}>
				Try again
			</Button>
		</div>
	{:else if chatService.conversations.length === 0}
		<div class="empty-state">
			<p>No conversations yet</p>
			<p class="empty-hint">Start a new conversation to see it here</p>
		</div>
	{:else}
		<ul class="conversation-list">
			{#each chatService.conversations as conversation (conversation.id)}
				<li>
					<button
						class="conversation-item"
						onclick={() => handleSelectConversation(conversation)}
						class:active={chatService.conversationId === conversation.id}
					>
						<div class="conversation-content">
							<span class="conversation-title">{conversation.title}</span>
							<span class="conversation-date">{formatDate(conversation.updatedAt)}</span>
						</div>
						<Button
							variant="tertiary"
							size="xsmall"
							icon={TrashIcon}
							onclick={(e: MouseEvent) => handleDeleteConversation(e, conversation.id)}
							aria-label="Delete conversation"
						/>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.history-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.history-header {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
		padding: var(--ax-space-12) var(--ax-space-16);
		border-bottom: 1px solid var(--ax-border-default);
		flex-shrink: 0;
	}

	.history-header h3 {
		margin: 0;
		font-size: var(--ax-font-size-medium);
		font-weight: var(--ax-font-weight-semibold);
	}

	.back-button {
		display: flex;
		align-items: center;
		padding: var(--ax-space-4) var(--ax-space-8);
		border: none;
		background: transparent;
		border-radius: var(--ax-border-radius-medium);
		cursor: pointer;
		color: var(--ax-text-action);
		font-size: var(--ax-font-size-small);
	}

	.back-button:hover {
		background-color: var(--ax-bg-hover);
	}

	.loading-state,
	.error-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-12);
		padding: var(--ax-space-32);
		text-align: center;
		color: var(--ax-text-subtle);
	}

	.empty-hint {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}

	.conversation-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		flex: 1;
	}

	.conversation-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--ax-space-12) var(--ax-space-16);
		border: none;
		border-bottom: 1px solid var(--ax-border-subtle);
		background: transparent;
		cursor: pointer;
		text-align: left;
		gap: var(--ax-space-8);
	}

	.conversation-item:hover {
		background-color: var(--ax-bg-hover);
	}

	.conversation-item.active {
		background-color: var(--ax-bg-selected);
	}

	.conversation-content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		min-width: 0;
		flex: 1;
	}

	.conversation-title {
		font-size: var(--ax-font-size-medium);
		color: var(--ax-text-neutral);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.conversation-date {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}
</style>
