<script lang="ts">
	import {
		ExclamationmarkTriangleFillIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';
	import UnknownIcon from './icons/UnknownIcon.svelte';

	export let state: string;
	export let size: string;
</script>

{#if state === 'FAILING'}
	<XMarkOctagonFillIcon style="color: var(--a-icon-danger)" title="Application is failing" />
{:else if state === 'NOTNAIS'}
	<ExclamationmarkTriangleFillIcon
		style="color: var(--a-icon-warning)"
		title="Application is not nais"
	/>
{:else if state === 'UNKNOWN'}
	<UnknownIcon
		{size}
		style="color: var(--a-icon-warning)"
		aria-label="Unknown application status"
		role="image"
	/>
{/if}
