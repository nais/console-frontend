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

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (inputValue.trim() && !disabled) {
			onSend(inputValue.trim());
			inputValue = '';
			resetTextareaHeight();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	}

	function handleInput() {
		adjustTextareaHeight();
	}

	function adjustTextareaHeight() {
		if (textareaElement) {
			textareaElement.style.height = 'auto';
			textareaElement.style.height = `${Math.min(textareaElement.scrollHeight, 150)}px`;
		}
	}

	function resetTextareaHeight() {
		if (textareaElement) {
			textareaElement.style.height = 'auto';
		}
	}
</script>

<form class="chat-input-container" onsubmit={handleSubmit}>
	<div class="input-wrapper">
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
		<Button
			type="submit"
			variant="primary"
			size="small"
			icon={PaperplaneIcon}
			disabled={disabled || !inputValue.trim()}
			aria-label="Send message"
		/>
	</div>
</form>

<style>
	.chat-input-container {
		padding: var(--ax-space-16);
		border-top: 1px solid var(--ax-border-default);
		background-color: var(--ax-bg-default);
	}

	.input-wrapper {
		display: flex;
		align-items: flex-end;
		gap: var(--ax-space-8);
	}

	textarea {
		flex: 1;
		padding: var(--ax-space-12);
		border: 1px solid var(--ax-border-default);
		border-radius: var(--ax-border-radius-medium);
		background-color: var(--ax-bg-default);
		color: var(--ax-text-default);
		font-family: inherit;
		font-size: var(--ax-font-size-medium);
		line-height: var(--ax-font-line-height-medium);
		resize: none;
		min-height: 44px;
		max-height: 150px;
		overflow-y: auto;
	}

	textarea:focus {
		outline: none;
		border-color: var(--ax-border-action);
		box-shadow: 0 0 0 2px var(--ax-border-action-subtle);
	}

	textarea:disabled {
		background-color: var(--ax-bg-subtle);
		cursor: not-allowed;
	}

	textarea::placeholder {
		color: var(--ax-text-subtle);
	}
</style>
