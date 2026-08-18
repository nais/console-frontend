<script lang="ts">
	import { differenceInDays, format, formatDistanceStrict, isSameYear } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import { onDestroy } from 'svelte';

	const DISTANCE_THRESHOLD_DAYS = 7;

	const {
		time,
		dateFormat = 'PPPP',
		distance = false
	}: {
		time: Date | string;
		dateFormat?: string;
		distance?: boolean;
	} = $props();

	let tick = $state(0);

	const normalizedTime = $derived(time instanceof Date ? time : new Date(time));
	const isValidDate = $derived(!Number.isNaN(normalizedTime.getTime()));

	let fullTimestamp = $derived(
		isValidDate ? format(normalizedTime, 'dd. MMMM yyyy HH:mm:ss', { locale: enGB }) : ''
	);

	function isRecent(): boolean {
		if (!isValidDate) return false;
		return Math.abs(differenceInDays(new Date(), normalizedTime)) < DISTANCE_THRESHOLD_DAYS;
	}

	function distanceText(): string {
		if (isRecent()) {
			return formatDistanceStrict(normalizedTime, Date.now(), { addSuffix: true });
		}
		if (isSameYear(normalizedTime, new Date())) {
			return format(normalizedTime, 'd MMM, HH:mm', { locale: enGB });
		}
		return format(normalizedTime, 'd MMM yyyy, HH:mm', { locale: enGB });
	}

	let text = $derived.by(() => {
		void tick;
		if (!isValidDate) return '';
		if (distance) {
			return distanceText();
		}
		return format(normalizedTime, dateFormat, { locale: enGB });
	});

	let tooltipContent = $derived.by(() => {
		void tick;
		if (!isValidDate) return '';
		if (distance && !isRecent()) {
			const relative = formatDistanceStrict(normalizedTime, Date.now(), { addSuffix: true });
			return `${fullTimestamp} (${relative})`;
		}
		return fullTimestamp;
	});

	let interval: ReturnType<typeof setInterval> | undefined = $state();
	let intervalDelay: number | undefined = $state();

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});

	$effect(() => {
		void tick;

		if (!distance || !isValidDate) {
			if (interval) {
				clearInterval(interval);
				interval = undefined;
				intervalDelay = undefined;
			}
			return;
		}

		const desiredDelay = isRecent() ? 1000 : 60_000;

		if (interval && intervalDelay === desiredDelay) {
			return;
		}

		if (interval) {
			clearInterval(interval);
		}

		intervalDelay = desiredDelay;
		interval = setInterval(() => {
			tick++;
		}, desiredDelay);
	});

	const datetime = $derived(isValidDate ? normalizedTime.toISOString() : undefined);
</script>

<time {datetime} title={tooltipContent || undefined}>
	{text}
</time>
