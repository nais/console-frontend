<script lang="ts">
	import { HelpText } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	const colors = {
		green: '#91dc75',
		blue: '#83bff6'
	};

	interface Props {
		helpText?: string;
		title: string;
		icon: Snippet<[{ color: string }]>;
		children: Snippet;
		color: keyof typeof colors;
		styled?: boolean;
	}

	let { helpText, title, icon, children, color: colorName, styled = true }: Props = $props();
	let color = $derived(colors[colorName]);
	const helpTextTitle = 'Hjelpetekst';
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
		<h4>
			{title}
			{#if helpText}
				<HelpText title={helpTextTitle}>{helpText}</HelpText>
			{/if}
		</h4>
		<p class="metric">
			{@render children()}
		</p>
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
	.summary {
		width: 100%;
	}
	.summary > h4 {
		display: flex;
		justify-content: space-between;
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
	}
	.metric {
		font-size: 1.5rem;
		margin: 0;
	}
</style>
