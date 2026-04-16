/**
 * Reactive state for the PageHeader component.
 * Pages can set warning/error indicators to display icons before the heading.
 * The state resets on navigation, so pages must actively set it.
 */
class PageHeaderState {
	warning = $state(false);
	error = $state(false);
}

export const pageHeaderState = new PageHeaderState();
