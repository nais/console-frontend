<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Time from '$lib/ui/Time.svelte';

	const { Story } = defineMeta({
		component: Time,
		title: 'Lib/Time',
		tags: ['autodocs']
	});

	// Create dates for different time distances
	const now = new Date();
	const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
	const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
	const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
	const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
	const specificDate = new Date('2024-06-15T14:30:00');
</script>

<Story name="Distance - recent" asChild>
	<p>Deployed <Time time={fiveMinutesAgo} distance={true} /></p>
</Story>

<Story name="Distance - hours ago" asChild>
	<p>Last updated <Time time={twoHoursAgo} distance={true} /></p>
</Story>

<Story name="Distance - days ago" asChild>
	<p>Created <Time time={threeDaysAgo} distance={true} /></p>
</Story>

<Story name="Distance - months ago" asChild>
	<p>First seen <Time time={twoMonthsAgo} distance={true} /></p>
</Story>

<Story name="Distance - short format" asChild>
	<div style="display: flex; flex-direction: column; gap: 0.5rem;">
		<p>5 minutes ago: <Time time={fiveMinutesAgo} distance={true} short={true} /></p>
		<p>2 hours ago: <Time time={twoHoursAgo} distance={true} short={true} /></p>
		<p>3 days ago: <Time time={threeDaysAgo} distance={true} short={true} /></p>
		<p>2 months ago: <Time time={twoMonthsAgo} distance={true} short={true} /></p>
	</div>
</Story>

<Story name="Formatted date - default" asChild>
	<p>Date: <Time time={specificDate} /></p>
</Story>

<Story name="Formatted date - custom format" asChild>
	<p>Date: <Time time={specificDate} dateFormat="dd/MM/yyyy HH:mm" /></p>
</Story>

<Story name="In context" asChild>
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<div>
			<strong>Last deployment:</strong>
			<Time time={twoHoursAgo} distance={true} />
		</div>
		<div>
			<strong>Created at:</strong>
			<Time time={specificDate} dateFormat="PPpp" />
		</div>
		<div style="font-size: 0.875rem; color: var(--ax-text-subtle);">
			Updated <Time time={fiveMinutesAgo} distance={true} />
		</div>
	</div>
</Story>
