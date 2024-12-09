<script lang="ts">
	import { format, formatDistance } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import { onDestroy, untrack } from 'svelte';
	interface Props {
		time: Date;
		dateFormat?: string;
		distance?: boolean;
	}

	let { time, dateFormat = 'PPPP', distance = false }: Props = $props();
	let title = format(time, 'dd. MMMM yyyy HH:mm:ss', { locale: enGB });
	let text: string = $state('');
	const distanceText = () =>
		formatDistance(time, Date.now(), {
			addSuffix: true,
			includeSeconds: true
		});
	let interval: ReturnType<typeof setTimeout> | undefined = $state();
	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		distance;
		untrack(() => {
			if (distance) {
				if (!interval) interval = setInterval(() => (text = distanceText()), 1000 * 60);
				text = distanceText();
			} else {
				if (interval) {
					clearInterval(interval);
					interval = undefined;
				}
				text = format(time, dateFormat, { locale: enGB });
			}
		});
	});
</script>

<time datetime={time.toTimeString()} {title}>
	{text}
</time>
