<script lang="ts">
	import { page } from '$app/state';
	import { replacer } from '#lib/replacer.js';
	import { themeSwitch } from '#lib/stores/theme.svelte.js';
	import { Button, Checkbox, Heading, Modal, Select, Theme } from '#lib/shadcn/ui/index.js';
	import type { FeedbackType } from './types';

	interface Props {
		close: () => void;
	}

	let { close }: Props = $props();
	const uid = $props.id();
	const detailsId = `${uid}-details`;
	const countId = `${uid}-count`;
	const errorId = `${uid}-error`;

	let type: FeedbackType | '' = $state('');
	let details = $state('');
	let anonymous: boolean = $state(false);
	let uri = '';

	let loading = $state(false);
	let feedbackSent: boolean = $state(false);

	let errorMessage: string = $state('');
	let errorType: boolean = $state(false);
	let errorDetails: boolean = $state(false);

	const maxlength = 3000;

	if (page.route.id !== null) {
		uri = replacer(page.route.id, page.params);
	}

	const FEEDBACK_TYPE: { value: FeedbackType | ''; text: string }[] = [
		{ value: '', text: 'Choose type of feedback' },
		{ value: 'BUG', text: 'Bug' },
		{ value: 'CHANGE_REQUEST', text: 'Change request' },
		{ value: 'QUESTION', text: 'Question' },
		{ value: 'OTHER', text: 'Other' }
	];

	const submitFeedback = async () => {
		if (type === '') {
			errorType = true;
		} else {
			errorType = false;
		}

		if (details === '' || details === undefined) {
			errorDetails = true;
		} else {
			errorDetails = false;
		}

		if (errorType || errorDetails) {
			return;
		}

		loading = true;
		try {
			const result = await fetch('/api/send-feedback', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					feedback: details,
					type: type,
					path: uri,
					anonymous: anonymous
				})
			});
			const data = await result.json();

			if (data.error) {
				errorMessage = data.error;
				return;
			}

			const response = result.ok ? 'Message sent!' : 'Failed to send message.';
			feedbackSent = true;
			return response;
		} catch (error) {
			console.error('Error:', error);
			return 'Error sending message: ' + error;
		} finally {
			loading = false;
		}
	};
</script>

<Theme theme={themeSwitch.theme}>
	<Modal open width="medium" onclose={close}>
		{#snippet header()}
			<Heading as="h1">Nais Console Feedback</Heading>
		{/snippet}

		{#if feedbackSent}
			<p>Thank you for your feedback!</p>
		{:else}
			<p>
				Help us improve Console! We value your input. Feedback will be associated with your
				logged-in email address. To provide feedback anonymously, check the box below.
			</p>
			<div class="wrapper">
				<Select size="small" label="Type" bind:value={type}>
					{#each FEEDBACK_TYPE as option (option)}
						<option value={option.value}>{option.text}</option>
					{/each}
				</Select>
				{#if errorType}
					<p class="field-error">Feedback type required</p>
				{/if}

				<label class="field-label" for={detailsId}> Details </label>
				<div class="details">
					<textarea
						class="textarea"
						id={detailsId}
						bind:value={details}
						rows="5"
						cols="40"
						{maxlength}
						style="resize: vertical; min-height: 16rem; "
						placeholder="Enter your feedback here..."
						disabled={feedbackSent}
						aria-describedby="{countId} {errorId}"></textarea>
					<span id={countId} class="char-count"
						>{maxlength - details.length} character{maxlength - details.length == 1 ? '' : 's'} remaining</span
					>
				</div>
				<div
					class="field-error-wrap"
					id={errorId}
					aria-relevant="additions removals"
					aria-live="polite"
				>
					{#if errorDetails}
						<p class="field-error">Feedback details required</p>
					{/if}
				</div>
				{#if errorMessage !== ''}
					<p class="field-error">{errorMessage}</p>
				{/if}
				<Checkbox bind:checked={anonymous}>Anonymous feedback</Checkbox>
			</div>
		{/if}
		{#snippet footer()}
			{#if feedbackSent}
				<Button variant="primary" size="small" onclick={close}>Close</Button>
			{:else}
				<Button variant="primary" size="small" {loading} onclick={submitFeedback}>Submit</Button>
				<Button variant="secondary" size="small" onclick={close}>Cancel</Button>
			{/if}
		{/snippet}
	</Modal>
</Theme>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		gap: var(--ax-space-16);
	}
	.details {
		display: flex;
		flex-direction: column;
		align-items: end;
	}
	.char-count {
		font-size: 0.75rem;
		color: var(--ax-text-neutral-subtle);
		margin: 0;
		padding-top: 0.2rem;
	}
	.field-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--foreground);
	}
	.textarea {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: calc(var(--radius) - 2px);
		border: 1px solid var(--input);
		background-color: var(--background);
		color: var(--foreground);
		font: inherit;
		font-size: 0.875rem;
		line-height: 1.45;
		box-sizing: border-box;
	}
	.textarea:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 1px;
		border-color: var(--ring);
	}
	.field-error {
		margin: 0;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--destructive);
	}
</style>
