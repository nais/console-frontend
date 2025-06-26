<script lang="ts">
	import { BodyShort, Heading, HelpText } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	const colors = {
		green: 'var(--ax-border-success-strong)',
		blue: 'var(--ax-border-brand-blue-strong)',
		grey: 'var(--ax-border-neutral-strong)'
	};

	interface Props {
		helpText?: string;
		helpTextTitle?: string;
		title: string;
		icon: Snippet<[{ color: string }]>;
		children: Snippet;
		color: keyof typeof colors;
		styled?: boolean;
	}

	let {
		helpText,
		helpTextTitle,
		title,
		icon,
		children,
		color: colorName,
		styled = true
	}: Props = $props();
	let color = $derived(colors[colorName]);
</script>

<div class="summaryCard">
	<div
		class="summaryIcon"
		class:withBorder={styled}
		class:withBackground={styled}
		style:--bg-color={color}
	>
		{@render icon({ color })}
	</div>
	<div class="summary">
		<div class="heading">
			<Heading level="2" size="xsmall">
				{title}
			</Heading>
			{#if helpText}
				<HelpText title={helpTextTitle ? helpTextTitle : ''}>{helpText}</HelpText>
			{/if}
		</div>
		<BodyShort>
			{@render children()}
		</BodyShort>
	</div>
</div>

<style>
	.summaryCard {
		display: grid;
		grid-template-columns: 50px 1fr;
		align-items: center;
		gap: 20px;
	}
	.summaryIcon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
	}
	.withBorder {
		border: 2px solid var(--bg-color);
		border-radius: 5px;
	}
	.withBackground {
		background-color: color-mix(in srgb, var(--bg-color) 10%, white);
	}
	:global(.dark) .withBackground {
		background-color: color-mix(in srgb, var(--bg-color) 10%, var(--ax-bg-default));
	}

	.summary {
		width: 100%;
	}
	.heading {
		display: flex;
		justify-content: space-between;
		color: var(--ax-text-neutral-subtle);
	}
</style>
