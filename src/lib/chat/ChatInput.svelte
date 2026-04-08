<script lang="ts">
	import { Button } from '@nais/ds-svelte-community';
	import { PaperplaneIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		onSend: (message: string) => void;
		disabled?: boolean;
	}

	let { onSend, disabled = false }: Props = $props();

	let inputValue = $state('');
	let textareaElement: HTMLTextAreaElement | undefined = $state();

	function handleSubmit(event: Event) {
		event.preventDefault();

		const message = inputValue.trim();
		if (!message || disabled) return;

		onSend(message);
		inputValue = '';
		resetTextareaHeight();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit(event);
		}
	}

	function handleInput() {
		adjustTextareaHeight();
	}

	function adjustTextareaHeight() {
		if (!textareaElement) return;

		textareaElement.style.height = 'auto';
		textareaElement.style.height = `${Math.min(textareaElement.scrollHeight, 160)}px`;
	}

	function resetTextareaHeight() {
		if (!textareaElement) return;
		textareaElement.style.height = 'auto';
	}
</script>

<form class="chat-input" onsubmit={handleSubmit}>
	<div class="input-shell">
		<textarea
			bind:this={textareaElement}
			bind:value={inputValue}
			onkeydown={handleKeyDown}
			oninput={handleInput}
			placeholder="Ask a question..."
			rows="1"
			{disabled}
			aria-label="Chat message input"
		></textarea>

		<div class="actions">
			<Button
				type="submit"
				variant="primary"
				size="small"
				icon={PaperplaneIcon}
				disabled={disabled || !inputValue.trim()}
				aria-label="Send message"
			/>
		</div>
	</div>

	<p class="hint">
		Press <kbd>Enter</kbd> to send, <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line
	</p>
</form>

<style>
	.chat-input {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		padding: var(--ax-space-12) var(--ax-space-16);
		background: var(--ax-bg-default);
	}

	.input-shell {
		display: flex;
		align-items: flex-end;
		gap: var(--ax-space-8);
		padding: 0;
		border: none;
		border-radius: 0;
		background: transparent;
		box-shadow: none;
		transition: none;
	}

	.input-shell:focus-within {
		border: none;
		box-shadow: none;
	}

	textarea {
		flex: 1;
		min-height: 2.75rem;
		max-height: 10rem;
		padding: var(--ax-space-8) 0;
		border: none;
		background: transparent;
		color: var(--ax-text-neutral);
		font: inherit;
		line-height: normal;
		resize: none;
		overflow-y: auto;
	}

	textarea:focus {
		outline: none;
	}

	textarea:disabled {
		color: var(--ax-text-neutral-subtle);
		cursor: not-allowed;
	}

	textarea::placeholder {
		color: var(--ax-text-neutral-subtle);
	}

	.actions {
		display: flex;
		align-items: center;
		padding-bottom: 0.125rem;
	}

	.hint {
		margin: 0;
		padding-inline: 0;
		color: var(--ax-text-neutral-subtle);
		font-size: var(--ax-font-size-small);
		line-height: normal;
	}

	kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.5rem;
		padding: 0 var(--ax-space-4);
		border: 1px solid var(--ax-border-default);
		border-bottom-width: 2px;
		border-radius: var(--ax-border-radius-small);
		background: var(--ax-bg-neutral-soft);
		color: var(--ax-text-neutral);
		font-size: 0.85em;
		font-family: inherit;
	}

	@media (max-width: 48rem) {
		.chat-input {
			padding: var(--ax-space-8) var(--ax-space-12);
		}

		.hint {
			display: none;
		}
	}
</style>
