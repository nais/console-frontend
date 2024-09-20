export function classes(
	props: SvelteRestProps,
	...classes: (string | { [key: string]: boolean })[]
): string {
	const c = classes
		.flatMap((x) => {
			if (typeof x === 'string') {
				return x;
			}
			return Object.keys(x).filter((k) => x[k]);
		})
		.join(' ');
	if (props.class) {
		return `${props.class} ${c}`;
	}
	return c;
}

export enum Focus {
	First = 1 << 0,
	Last = 1 << 1,
	Previous = 1 << 2,
	Next = 1 << 3,
	Wrap = 1 << 4
}

enum Direction {
	Previous = -1,
	Next = 1
}

export function focusable(focusable: HTMLElement[], focus: Focus) {
	const active = document.activeElement;

	const direction: Direction = (() => {
		if (focus & (Focus.Next | Focus.First)) {
			return Direction.Next;
		}
		if (focus & (Focus.Previous | Focus.Last)) {
			return Direction.Previous;
		}

		throw new Error(
			'Invalid focus direction. Missing Focus.Next, Focus.First, Focus.Previous or Focus.Last'
		);
	})();

	const index = (() => {
		if (focus & Focus.First) {
			return 0;
		}
		if (focus & Focus.Last) {
			return focusable.length - 1;
		}
		if (focus & Focus.Previous) {
			return focusable.indexOf(active as HTMLElement) - 1;
		}
		if (focus & Focus.Next) {
			return focusable.indexOf(active as HTMLElement) + 1;
		}

		throw new Error('Missing Focus.First, Focus.Last, Focus.Previous or Focus.Next');
	})();

	let next: HTMLElement | null = null;
	let offset = 0;
	do {
		if (offset >= focusable.length) {
			throw new Error('Invalid focusable list');
		}

		let nextIndex = index + offset;
		if (focus & Focus.Wrap) {
			nextIndex = (nextIndex + focusable.length) % focusable.length;
		} else if (nextIndex < 0 || nextIndex >= focusable.length) {
			return;
		}

		next = focusable[nextIndex];

		next.focus();

		offset += direction;
	} while (next !== document.activeElement);
}

export const omit = (obj: object, ...props: string[]) =>
	Object.entries(obj)
		.filter(([key]) => !props.includes(key))
		.reduce(
			(obj, [key, value]) => ({
				...obj,
				[key]: value
			}),
			{}
		);
