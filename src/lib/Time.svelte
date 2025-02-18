<script lang="ts">
	import { format, formatDistanceStrict } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import { onDestroy, untrack } from 'svelte';
	interface Props {
		time: Date;
		dateFormat?: string;
		distance?: boolean;
	}

	let { time, dateFormat = 'PPPP', distance = false }: Props = $props();
	let title = format(time, 'dd. MMMM yyyy HH:mm:ss', { locale: enGB });
	const distanceText = () =>
		formatDistanceStrict(time, Date.now(), {
			addSuffix: true
			// includeSeconds: true
		});
	let text: string = $state(distanceText());
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
				if (!interval) interval = setInterval(() => (text = distanceText()), 60);
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
