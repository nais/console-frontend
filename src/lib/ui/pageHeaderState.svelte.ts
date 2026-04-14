/**
 * Reactive state for the PageHeader component.
 * Pages can set warning/error indicators to display icons before the heading.
 * The state resets on navigation, so pages must actively set it.
 */
let showWarning = $state(false);
let showError = $state(false);

export function setPageHeaderWarning(value: boolean) {
	showWarning = value;
}

export function getPageHeaderWarning() {
	return showWarning;
}

export function setPageHeaderError(value: boolean) {
	showError = value;
}

export function getPageHeaderError() {
	return showError;
}
