const formatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'Europe/Oslo',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hourCycle: 'h23'
});

export function formatOslo(date: Date): string {
	const parts = Object.fromEntries(
		formatter.formatToParts(date).map(({ type, value }) => [type, value])
	);
	return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export function parseOslo(value: string): Date {
	const wallTime = new Date(`${value}Z`);
	const osloAtGuess = new Date(`${formatOslo(wallTime)}Z`);
	return new Date(wallTime.getTime() - (osloAtGuess.getTime() - wallTime.getTime()));
}
