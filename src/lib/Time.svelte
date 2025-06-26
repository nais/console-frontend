<script lang="ts">
	import { format, formatDistanceStrict, intervalToDuration } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import { onDestroy, untrack } from 'svelte';

	const {
		time,
		dateFormat = 'PPPP',
		distance = false,
		short = false
	}: {
		time: Date;
		dateFormat?: string;
	} & ({ distance?: false; short?: never } | { distance: true; short?: boolean }) = $props();

	let title = format(time, 'dd. MMMM yyyy HH:mm:ss', { locale: enGB });

	function distanceText(): string {
		return formatDistanceStrict(time, Date.now(), { addSuffix: true });
	}

	function distanceShortText(): string {
		const duration = intervalToDuration({ start: time, end: new Date() });

		if (duration.years) return `${duration.years}y`;
		if (duration.months) return `${duration.months}mo`;
		if (duration.days) return `${duration.days}d`;
		if (duration.hours) return `${duration.hours}h`;
		if (duration.minutes) return `${duration.minutes}m`;
		return `${duration.seconds ?? 0}s`;
	}

	function getDisplayText(): string {
		if (distance) {
			return short ? distanceShortText() : distanceText();
		}
		return format(time, dateFormat, { locale: enGB });
	}

	let text: string = $state(getDisplayText());
	let interval: ReturnType<typeof setTimeout> | undefined = $state();

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		distance;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		time;

		untrack(() => {
			if (distance) {
				if (!interval) {
					interval = setInterval(() => {
						text = getDisplayText();
					}, 1000);
				}
				text = getDisplayText();
			} else {
				if (interval) {
					clearInterval(interval);
					interval = undefined;
				}
				text = getDisplayText();
			}
		});
	});
</script>

<time datetime={time.toISOString()} {title}>
	{text}
</time>
