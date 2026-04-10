/**
 * Reactive state for the PageHeader component.
 * Pages can set `showWarning` to display a warning icon before the heading.
 * The state resets on navigation, so pages must actively set it.
 */
let showWarning = $state(false);

export function setPageHeaderWarning(value: boolean) {
	showWarning = value;
}

export function getPageHeaderWarning() {
	return showWarning;
}
