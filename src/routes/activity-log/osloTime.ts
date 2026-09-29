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
	let guess = wallTime;
	// The offset at the UTC guess may differ from the offset at the actual Oslo instant.
	for (let attempt = 0; attempt < 3; attempt++) {
		const observed = formatOslo(guess);
		if (observed === value) return guess;
		guess = new Date(guess.getTime() + wallTime.getTime() - Date.parse(`${observed}Z`));
	}
	throw new RangeError('This time does not exist in Oslo due to daylight saving time.');
}
