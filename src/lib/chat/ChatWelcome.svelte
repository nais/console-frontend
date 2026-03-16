<script lang="ts">
	import NaisChatIcon from '$lib/icons/NaisChatIcon.svelte';
	import { Alert, BodyLong, BodyShort, Heading } from '@nais/ds-svelte-community';
	import { ClockDashedIcon } from '@nais/ds-svelte-community/icons';
	import { chatService } from './chatService.svelte';
</script>

<div class="welcome-container">
	<div class="welcome-content">
		<div class="icon-wrapper">
			<NaisChatIcon size="48px" />
		</div>

		<Heading size="medium" as="h3">Welcome to Nais assistant</Heading>

		<BodyLong>
			Ask questions about your applications, deployments, and the Nais platform. I'm here to help
			you navigate and understand your infrastructure.
		</BodyLong>

		<button class="history-hint" onclick={() => chatService.toggleHistory()}>
			<ClockDashedIcon />
			<BodyShort size="small">View conversation history</BodyShort>
		</button>

		<Alert variant="warning" size="small">
			<Heading size="xsmall" as="h4">Please note</Heading>
			<BodyLong size="small">
				This assistant is experimental and may occasionally provide inaccurate information. Always
				verify important details through official documentation or your team before making critical
				changes to your infrastructure.
			</BodyLong>
		</Alert>
	</div>
</div>

<style>
	.welcome-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: var(--ax-space-24);
		text-align: center;
	}

	.welcome-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--ax-space-16);
		max-width: 320px;
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background-color: var(--ax-bg-subtle);
		color: var(--ax-text-subtle);
	}

	.history-hint {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-8) var(--ax-space-16);
		border: 1px solid var(--ax-border-default);
		border-radius: var(--ax-border-radius-medium);
		background: transparent;
		color: var(--ax-text-action);
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.history-hint:hover {
		background-color: var(--ax-bg-hover);
	}
</style>
