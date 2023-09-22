<script lang="ts">
	import Nais from './icons/Nais.svelte';
	import UnknownIcon from './icons/UnknownIcon.svelte';
	import WarningIcon from './icons/WarningIcon.svelte';

	export let state: string;
	export let size: string;
</script>

{#if state === 'NAIS'}
	<Nais {size} style="color: var(--a-icon-success)" aria-label="Application is nais" role="image" />
{:else if state === 'FAILING'}
	<WarningIcon
		{size}
		style="color: var(--a-icon-danger)"
		aria-label="Application is failing"
		role="image"
	/>
{:else if state === 'NOTNAIS'}
	<Nais
		{size}
		style="color: var(--a-icon-warning)"
		aria-label="Application is not nais"
		role="image"
	/>
{:else if state === 'UNKNOWN'}
	<UnknownIcon
		{size}
		style="color: var(--a-icon-warning)"
		aria-label="Unknown application status"
		role="image"
	/>
{/if}
