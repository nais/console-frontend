<script lang="ts">
	import { Button } from '#lib/shadcn/ui/index.js';
	import LogVolume from '#lib/domain/logs/LogVolume.svelte';
	import type { LogRange, VolumeBucket } from '#lib/domain/logs/loki.js';

	const start = Date.parse('2026-11-09T12:00:00Z');
	const buckets = [
		{ start, end: start + 1000, count: 0 },
		{ start: start + 1000, end: start + 2000, count: 25 },
		{ start: start + 2000, end: start + 3000, count: 100 },
		{ start: start + 3000, end: start + 3500, count: 10 }
	];
	let empty = $state(false);
	let loading = $state(false);
	let selected = $state<VolumeBucket>();
	let range = $state<LogRange>();
</script>

<Button onclick={() => (empty = !empty)}>Toggle empty</Button>
<Button onclick={() => (loading = !loading)}>Toggle loading</Button>
{#each [{ label: 'Last minute', duration: 60_000 }, { label: 'Under five minutes', duration: 299_999 }, { label: 'Five minutes', duration: 300_000 }, { label: 'One day', duration: 86_400_000 }] as { label, duration } (duration)}
	<Button
		onclick={() =>
			(range = {
				start: (BigInt(start) * 1_000_000n).toString(),
				end: (BigInt(start + duration) * 1_000_000n).toString()
			})}
	>
		{label}
	</Button>
{/each}
<LogVolume
	buckets={empty ? buckets.map((bucket) => ({ ...bucket, count: 0 })) : buckets}
	{range}
	{loading}
	onselect={(bucket) => (selected = bucket)}
/>
<p role="status" aria-label="Selected interval">
	{selected ? `${selected.start}/${selected.end}/${selected.count}` : 'None'}
</p>
