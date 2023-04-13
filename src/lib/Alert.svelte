<script lang="ts">
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import LightbulbFilled from '$lib/icons/LightbulbFilled.svelte';

	type Variant = 'warning' | 'idea';

	export let title = '';
	export let variant: Variant = 'warning';
</script>

<div class="box {variant == 'warning' ? 'warning' : 'idea'}">
	<div class="icon">
		{#if variant === 'warning'}
			<WarningIcon width="1.5em" height="1.5em" />
		{:else if variant === 'idea'}
			<LightbulbFilled width="1.5em" height="1.5em" />
		{/if}
	</div>
	<div>
		{#if title}
			<h4 class="title">{title}</h4>
		{/if}
		<slot />
	</div>
</div>

<style>
	.box {
		padding: 0.25rem;
		margin-top: 0.25rem;
		margin-bottom: 2rem;
		display: flex;
		gap: 0.5rem;
		justify-content: flex-start;
		border-radius: 0.25rem;
	}
	.warning {
		border: 1px solid var(--a-border-warning);
		background: var(--a-surface-warning-subtle);
	}
	.idea {
		border: 1px solid var(--a-border-info);
		background: var(--a-surface-info-subtle);
	}
	.warning > .icon {
		color: var(--a-icon-warning);
		width: 2em;
		height: 2em;
		margin: 1rem;
	}
	.idea > .icon {
		color: var(--a-icon-info);
		width: 2em;
		height: 2em;
		margin: 1rem;
	}
	.title {
		margin-bottom: 0.5rem;
	}
</style>
