<script lang="ts">
	import {
		CheckmarkCircleFillIcon,
		ExclamationmarkTriangleFillIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';
	import UnknownIcon from './icons/UnknownIcon.svelte';

	export let state: string;
	export let size: string;
</script>

{#if state === 'NAIS'}
	<CheckmarkCircleFillIcon style="color: var(--a-icon-success)" title="Workload is nais" />
{:else if state === 'FAILING'}
	<XMarkOctagonFillIcon style="color: var(--a-icon-danger)" title="Workload is failing" />
{:else if state === 'NOTNAIS'}
	<ExclamationmarkTriangleFillIcon
		style="color: var(--a-icon-warning)"
		title="Workload is not nais"
	/>
{:else if state === 'UNKNOWN'}
	<UnknownIcon
		{size}
		style="color: var(--a-icon-warning)"
		aria-label="Unknown workload status"
		role="image"
	/>
{/if}
