<script lang="ts">
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import LightbulbFilled from '$lib/icons/LightbulbFilled.svelte';

	type Variant = 'warning' | 'idea' | 'tip';

	export let title = '';
	export let variant: Variant = 'warning';
	const typeClass = () => {
		switch (variant) {
			case 'warning':
				return 'warning';
			case 'idea':
				return 'idea';
			case 'tip':
				return 'tip';
			default:
				return 'warning';
		}
	};
</script>

<div class="box {typeClass()}">
	<div class="icon">
		{#if variant === 'warning'}
			<WarningIcon width="1.5em" height="1.5em" />
		{:else if variant === 'idea'}
			<LightbulbFilled width="1.5em" height="1.5em" />
		{:else if variant === 'tip'}
			<LightbulbFilled width="1.5em" height="1.5em" />
		{/if}
	</div>
	<div class="content">
		{#if title}
			<h4 class="title">{title}</h4>
		{/if}
		<slot />
	</div>
</div>

<style>
	.box {
		padding: 0.25rem;
		padding-right: 1rem;
		margin-top: 0.25rem;
		margin-bottom: 2rem;
		display: flex;
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
	.tip {
		border: 1px solid var(--a-border-default);
		background: var(--a-surface-info-default);
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
	.tip > .icon {
		color: var(--a-icon-warning);
		width: 2em;
		height: 2em;
		margin: 1rem;
	}
	.title {
		margin-bottom: 0.5rem;
	}
	.content {
		align-self: center;
	}
</style>
