export async function load(event) {
	const interval = event.url.searchParams.get('interval') ?? '7d';

	return {
		interval
	};
}
