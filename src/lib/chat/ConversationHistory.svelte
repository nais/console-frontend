<script lang="ts">
	import { BodyShort, Button, Detail, Heading, Loader } from '@nais/ds-svelte-community';
	import { ArrowLeftIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import { chatService, type ConversationSummary } from './chatService.svelte';

	function formatDate(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
		}

		if (diffDays === 1) {
			return 'Yesterday';
		}

		if (diffDays < 7) {
			return date.toLocaleDateString(undefined, { weekday: 'long' });
		}

		return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}

	async function handleSelectConversation(conversation: ConversationSummary) {
		await chatService.loadConversation(conversation.id);
	}

	async function handleDeleteConversation(event: MouseEvent, conversationId: string) {
		event.stopPropagation();
		await chatService.deleteConversation(conversationId);
	}

	function handleBack() {
		chatService.showHistory = false;
	}
</script>

<div class="history-view">
	<div class="history-toolbar">
		<Button
			variant="tertiary-neutral"
			size="small"
			icon={ArrowLeftIcon}
			onclick={handleBack}
			aria-label="Back to chat"
		>
			Back
		</Button>
	</div>

	<div class="history-content">
		<div class="history-intro">
			<Heading size="small" level="3">Conversation history</Heading>
			<Detail>Reopen a previous conversation or remove one you no longer need.</Detail>
		</div>

		{#if chatService.isLoadingConversations}
			<div class="state-card">
				<Loader size="medium" />
				<BodyShort>Loading conversations…</BodyShort>
			</div>
		{:else if chatService.conversationsError}
			<div class="state-card">
				<BodyShort>{chatService.conversationsError}</BodyShort>
				<Button variant="secondary" size="small" onclick={() => chatService.fetchConversations()}>
					Try again
				</Button>
			</div>
		{:else if chatService.conversations.length === 0}
			<div class="state-card">
				<BodyShort>No conversations yet</BodyShort>
				<Detail>Start a new conversation and it will appear here.</Detail>
			</div>
		{:else}
			<ul class="conversation-list">
				{#each chatService.conversations as conversation (conversation.id)}
					<li>
						<div
							class="conversation-row"
							class:active={chatService.conversationId === conversation.id}
						>
							<button
								class="conversation-button"
								type="button"
								onclick={() => handleSelectConversation(conversation)}
								aria-label={`Open conversation ${conversation.title}`}
							>
								<div class="conversation-copy">
									<span class="conversation-title">{conversation.title}</span>
									<span class="conversation-date">{formatDate(conversation.updatedAt)}</span>
								</div>
							</button>

							<Button
								variant="tertiary-neutral"
								size="xsmall"
								icon={TrashIcon}
								onclick={(event: MouseEvent) => handleDeleteConversation(event, conversation.id)}
								aria-label={`Delete conversation ${conversation.title}`}
							/>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.history-view {
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
		background: var(--ax-bg-default);
	}

	.history-toolbar {
		padding: var(--ax-space-12) var(--ax-space-16) 0;
	}

	.history-content {
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
		gap: var(--ax-space-12);
		padding: var(--ax-space-16);
	}

	.history-intro {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	.state-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-12);
		padding: var(--ax-space-24) var(--ax-space-20);
		border: 1px solid var(--ax-border-neutral-subtle);
		border-radius: var(--ax-border-radius-medium);
		background: var(--ax-bg-neutral-soft);
		text-align: center;
	}

	.conversation-list {
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
		gap: var(--ax-space-4);
		margin: 0;
		padding: 0;
		list-style: none;
		overflow-y: auto;
	}

	.conversation-row {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
		padding: var(--ax-space-4);
		border: 1px solid transparent;
		border-radius: var(--ax-border-radius-medium);
		background: transparent;
		transition:
			border-color 120ms ease,
			background-color 120ms ease;
	}

	.conversation-row:hover {
		background: var(--ax-bg-neutral-soft);
	}

	.conversation-row.active {
		border-color: var(--ax-border-neutral-subtle);
		background: var(--ax-bg-neutral-soft);
	}

	.conversation-button {
		display: flex;
		flex: 1;
		min-width: 0;
		padding: var(--ax-space-8) var(--ax-space-12);
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
	}

	.conversation-button:focus-visible {
		outline: 3px solid var(--ax-border-focus);
		outline-offset: 2px;
		border-radius: var(--ax-border-radius-medium);
	}

	.conversation-copy {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: var(--ax-space-2);
	}

	.conversation-title {
		overflow: hidden;
		color: var(--ax-text-default);
		font-size: var(--ax-font-size-medium);
		font-weight: var(--ax-font-weight-bold);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.conversation-date {
		color: var(--ax-text-subtle);
		font-size: var(--ax-font-size-small);
		line-height: var(--ax-font-line-height-medium);
	}

	@media (max-width: 48rem) {
		.history-toolbar {
			padding: var(--ax-space-12) var(--ax-space-12) 0;
		}

		.history-content {
			padding: var(--ax-space-12);
		}
	}
</style>
