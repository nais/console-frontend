<script lang="ts">
	import { euroValueFormatter, numberFormatter } from '#lib/utils/formatters.js';
	import { BodyShort, Heading, TextField } from '#lib/shadcn/ui/index.js';
	import {
		backupRetention,
		backupRetentionError,
		estimateBackupCost,
		parseBackupRetention
	} from './backupRetention.js';

	interface Props {
		value?: string;
		/** Storage in GiB; stands in for the size of a base backup when estimating cost. */
		diskSizeGiB?: number;
		error?: string;
		editing?: boolean;
	}

	let { value = $bindable(''), diskSizeGiB, error, editing = false }: Props = $props();

	const uid = $props.id();
	let touched = $state(false);
	let validationError = $derived(backupRetentionError(value));
	let days = $derived(parseBackupRetention(value));
	let estimate = $derived(
		days !== undefined && diskSizeGiB && diskSizeGiB > 0
			? estimateBackupCost(diskSizeGiB, days)
			: undefined
	);
</script>

<section aria-labelledby="{uid}-heading" class="retention">
	<Heading as="h2" size="small" id="{uid}-heading">Point-in-time recovery window</Heading>
	<TextField
		name="backupRetentionDays"
		label="Recovery window (days)"
		inputmode="numeric"
		onblur={() => (touched = true)}
		error={touched || error ? (error ?? validationError) : undefined}
		description={editing
			? `${backupRetention.min}–${backupRetention.max} days. Shortening removes older backups permanently.`
			: `${backupRetention.min}–${backupRetention.max} days.`}
		bind:value
	/>
	{#if estimate}
		<BodyShort size="small">
			Estimated cost: up to about {euroValueFormatter(estimate.eurPerMonth)} per month ({numberFormatter(
				diskSizeGiB ?? 0,
				0
			)} GiB × {(days ?? 0) + 1} nightly backups).
		</BodyShort>
	{/if}
</section>

<style>
	.retention {
		display: grid;
		gap: var(--nais-space-12);
	}
</style>
