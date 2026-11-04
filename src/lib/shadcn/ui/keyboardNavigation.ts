export function focusGroupItem(
	event: KeyboardEvent,
	container: HTMLElement,
	selector: string,
	orientation: 'horizontal' | 'vertical'
): HTMLElement | undefined {
	const previous = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
	const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
	if (![previous, next, 'Home', 'End'].includes(event.key)) return;
	if (!(event.target instanceof HTMLElement)) return;
	const target = event.target;

	const items = [...container.querySelectorAll<HTMLElement>(selector)].filter(
		(item) => !item.matches('[disabled], [aria-disabled="true"]')
	);
	if (!items.length) return;
	const current = items.findIndex((item) => item === target || item.contains(target));
	let index: number;
	if (event.key === 'Home') index = 0;
	else if (event.key === 'End') index = items.length - 1;
	else if (current < 0) index = event.key === previous ? items.length - 1 : 0;
	else index = (current + (event.key === previous ? -1 : 1) + items.length) % items.length;
	event.preventDefault();
	items[index].focus();
	return items[index];
}
