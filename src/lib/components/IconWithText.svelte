<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		icon?: Snippet<[]>;
		size?: 'small' | 'medium' | 'large';
	}

	let { icon, size = 'medium', text }: Props = $props();

	const iconSize: string = size === 'small' ? '18px' : size === 'medium' ? '24px' : '32px';
</script>

<div>
	{#if icon}
		{@render icon()}
	{/if}
	{text}
</div>
