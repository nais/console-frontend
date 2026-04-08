<script lang="ts">
	import { Button, Detail, Heading } from '@nais/ds-svelte-community';
	import { ClockDashedIcon, PlusIcon, XMarkIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		title: string;
		subtitle: string;
		showHistory?: boolean;
		canStartNew?: boolean;
		onToggleHistory: () => void;
		onNewChat: () => void;
		onClose: () => void;
	}

	let {
		title,
		subtitle,
		showHistory = false,
		canStartNew = false,
		onToggleHistory,
		onNewChat,
		onClose
	}: Props = $props();
</script>

<header class="panel-header">
	<div class="panel-heading">
		<Heading level="2" size="small">{title}</Heading>
		<Detail>{subtitle}</Detail>
	</div>

	<div class="header-actions">
		<Button
			variant="tertiary-neutral"
			size="small"
			icon={ClockDashedIcon}
			onclick={onToggleHistory}
			aria-pressed={showHistory}
			aria-label={showHistory ? 'Back to current conversation' : 'Open conversation history'}
		>
			{showHistory ? 'Chat' : 'History'}
		</Button>

		{#if canStartNew && !showHistory}
			<Button
				variant="tertiary-neutral"
				size="small"
				icon={PlusIcon}
				onclick={onNewChat}
				aria-label="Start a new chat"
			>
				New
			</Button>
		{/if}

		<Button
			variant="tertiary-neutral"
			size="small"
			icon={XMarkIcon}
			onclick={onClose}
			aria-label="Close assistant panel"
		/>
	</div>
</header>

<style>
	.panel-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--ax-space-16);
		padding: var(--ax-space-16);
		border-block-end: 1px solid var(--ax-border-neutral-subtle);
		background: var(--ax-bg-default);
	}

	.panel-heading {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		min-width: 0;
	}

	.panel-heading :global(:where(p)) {
		color: var(--ax-text-subtle);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		flex-shrink: 0;
	}

	@media (max-width: 48rem) {
		.panel-header {
			padding-inline: var(--ax-space-12);
		}
	}
</style>
