<script lang="ts">
	import {
		differenceInDays,
		differenceInHours,
		differenceInMinutes,
		differenceInMonths,
		differenceInSeconds,
		differenceInYears,
		format,
		formatDistanceStrict
	} from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import { onDestroy } from 'svelte';

	const {
		time: rawTime,
		dateFormat = 'PPPP',
		distance = false,
		short = false
	}: {
		time: Date | string;
		dateFormat?: string;
	} & ({ distance?: false; short?: never } | { distance: true; short?: boolean }) = $props();

	// Accept either a `Date` (Houdini auto-deserialized scalar) or an ISO-8601
	// string (urql + GraphQL Code Generator default for the `Time` scalar).
	// Normalize to `Date` once so the rest of the component doesn't care.
	let time = $derived(rawTime instanceof Date ? rawTime : new Date(rawTime));

	let title = $derived(format(time, 'dd. MMMM yyyy HH:mm:ss', { locale: enGB }));

	function distanceText(): string {
		return formatDistanceStrict(time, Date.now(), { addSuffix: true });
	}

	function distanceShortText(): string {
		const now = new Date();

		const seconds = differenceInSeconds(now, time);
		if (seconds < 60) return `${Math.ceil(seconds)}s`;

		const minutes = differenceInMinutes(now, time);
		if (minutes < 60) return `${Math.ceil(minutes)}m`;

		const hours = differenceInHours(now, time);
		if (hours < 24) return `${Math.ceil(hours)}h`;

		const days = differenceInDays(now, time);
		if (days < 30) return `${Math.ceil(days)}d`;

		const months = differenceInMonths(now, time);
		if (months < 12) return `${Math.ceil(months)}mo`;

		const years = differenceInYears(now, time);
		return `${Math.ceil(years)}y`;
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
		text = getDisplayText();

		if (!distance) {
			if (interval) {
				clearInterval(interval);
				interval = undefined;
			}
			return;
		}

		if (!interval) {
			interval = setInterval(() => {
				text = getDisplayText();
			}, 1000);
		}
	});
</script>

<time datetime={time.toISOString()} {title}>
	{text}
</time>
