<script lang="ts">
	import { Tooltip } from '@nais/ds-svelte-community';
	import { differenceInDays, format, formatDistanceStrict, isSameYear } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import { onDestroy } from 'svelte';

	const DISTANCE_THRESHOLD_DAYS = 7;

	const {
		time,
		dateFormat = 'PPPP',
		distance = false
	}: {
		time: Date;
		dateFormat?: string;
		distance?: boolean;
	} = $props();

	let tick = $state(0);

	let fullTimestamp = $derived(format(time, 'dd. MMMM yyyy HH:mm:ss', { locale: enGB }));

	function isRecent(): boolean {
		return differenceInDays(new Date(), time) < DISTANCE_THRESHOLD_DAYS;
	}

	function distanceText(): string {
		if (isRecent()) {
			return formatDistanceStrict(time, Date.now(), { addSuffix: true });
		}
		if (isSameYear(time, new Date())) {
			return format(time, 'd MMM, HH:mm', { locale: enGB });
		}
		return format(time, 'd MMM yyyy, HH:mm', { locale: enGB });
	}

	let text = $derived.by(() => {
		void tick;
		if (distance) {
			return distanceText();
		}
		return format(time, dateFormat, { locale: enGB });
	});

	let tooltipContent = $derived.by(() => {
		void tick;
		if (distance && !isRecent()) {
			const relative = formatDistanceStrict(time, Date.now(), { addSuffix: true });
			return `${fullTimestamp} (${relative})`;
		}
		return fullTimestamp;
	});

	let interval: ReturnType<typeof setTimeout> | undefined = $state();

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});

	$effect(() => {
		if (!distance) {
			if (interval) {
				clearInterval(interval);
				interval = undefined;
			}
			return;
		}

		if (!interval) {
			interval = setInterval(
				() => {
					tick++;
				},
				isRecent() ? 1000 : 60_000
			);
		}
	});

	const datetime = $derived.by(() => {
		const d = time instanceof Date ? time : new Date(time as string);
		return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
	});
</script>

<Tooltip content={tooltipContent}>
	<time {datetime}>
		{text}
	</time>
</Tooltip>
