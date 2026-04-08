<script lang="ts">
	import NaisChatIcon from '$lib/icons/NaisChatIcon.svelte';
	import { BodyLong, BodyShort, Heading } from '@nais/ds-svelte-community';
	import { ClockDashedIcon } from '@nais/ds-svelte-community/icons';
	import { chatService } from './chatService.svelte';

	const suggestions = [
		'Why is my app not starting in dev?',
		'Show me recent deployments for my team',
		'How do I configure ingress on Nais?',
		'What does this alert mean?'
	];

	function useSuggestion(prompt: string) {
		void chatService.sendMessage(prompt);
	}

	function openHistory() {
		chatService.toggleHistory();
	}
</script>

<div class="welcome-container">
	<div class="welcome-card">
		<div class="hero">
			<div class="icon-wrapper" aria-hidden="true">
				<NaisChatIcon size="32px" />
			</div>

			<div class="hero-copy">
				<Heading size="small" as="h3">Nais assistant</Heading>
				<BodyLong size="small">
					Ask about workloads, deployments, alerts, or how the platform works. I can help you
					investigate what is happening and point you to the right docs or Console pages.
				</BodyLong>
			</div>
		</div>

		<div class="suggestions">
			<BodyShort size="small" class="section-title">Try one of these</BodyShort>

			<div class="suggestion-list">
				{#each suggestions as suggestion (suggestion)}
					<button class="suggestion-button" onclick={() => useSuggestion(suggestion)}>
						{suggestion}
					</button>
				{/each}
			</div>
		</div>

		<div class="footer">
			<button class="history-link" onclick={openHistory}>
				<ClockDashedIcon aria-hidden="true" />
				<span>Conversation history</span>
			</button>

			<BodyShort size="small" class="disclaimer">
				Experimental feature — verify important details before making changes.
			</BodyShort>
		</div>
	</div>
</div>

<style>
	.welcome-container {
		display: flex;
		flex: 1;
		align-items: flex-start;
		justify-content: center;
		padding: var(--ax-space-32);
		background: var(--ax-bg-default);
	}

	.welcome-card {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-32);
		width: 100%;
		max-width: 38rem;
		padding: var(--ax-space-32);
		border: 1px solid var(--ax-border-neutral-subtle);
		border-radius: var(--ax-border-radius-medium);
		background: var(--ax-bg-default);
	}

	.hero {
		display: flex;
		align-items: flex-start;
		gap: var(--ax-space-20);
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 3rem;
		height: 3rem;
		border-radius: var(--ax-border-radius-medium);
		background: var(--ax-bg-default);
		color: var(--ax-text-subtle);
	}

	.hero-copy {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
		min-width: 0;
	}

	:global(.section-title),
	:global(.disclaimer) {
		color: var(--ax-text-subtle);
	}

	.suggestions {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.suggestion-list {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.suggestion-button {
		padding: var(--ax-space-16);
		border: 1px solid var(--ax-border-neutral-subtle);
		border-radius: var(--ax-border-radius-medium);
		background: var(--ax-bg-default);
		color: var(--ax-text-default);
		text-align: left;
		font: inherit;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease,
			box-shadow 120ms ease;
	}

	.suggestion-button:hover {
		background: var(--ax-bg-default);
		border-color: var(--ax-border-default);
	}

	.suggestion-button:focus-visible {
		outline: 3px solid var(--ax-border-focus);
		outline-offset: 2px;
	}

	.footer {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		padding-top: var(--ax-space-8);
	}

	.history-link {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-8);
		width: fit-content;
		padding: 0;
		border: none;
		background: transparent;
		color: var(--ax-text-subtle);
		font: inherit;
		cursor: pointer;
	}

	.history-link:hover {
		text-decoration: underline;
	}

	.history-link:focus-visible {
		outline: 3px solid var(--ax-border-focus);
		outline-offset: 2px;
		border-radius: var(--ax-border-radius-small);
	}

	@media (max-width: 48rem) {
		.welcome-container {
			padding: var(--ax-space-20);
		}

		.welcome-card {
			gap: var(--ax-space-24);
			padding: var(--ax-space-24);
		}

		.hero {
			gap: var(--ax-space-16);
		}
	}
</style>
