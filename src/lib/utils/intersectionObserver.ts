import { browser } from '$app/environment';

/**
 * Shared intersection observer service to optimize performance when multiple
 * components need to track visibility. Instead of creating multiple IntersectionObserver
 * instances, this service uses a single observer to handle all visibility tracking.
 */
class SharedIntersectionObserver {
	private observer: IntersectionObserver | null = null;
	private callbacks = new Map<Element, (isVisible: boolean) => void>();

	constructor() {
		// Only create observer in browser environment
		if (browser && typeof IntersectionObserver !== 'undefined') {
			this.observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						const callback = this.callbacks.get(entry.target);
						callback?.(entry.isIntersecting);
					});
				},
				{
					// Use default root (viewport)
					rootMargin: '50px', // Start loading slightly before element comes into view
					threshold: 0 // Trigger as soon as any part is visible
				}
			);
		}
	}

	/**
	 * Start observing an element for intersection changes
	 */
	observe(element: Element, callback: (isVisible: boolean) => void) {
		if (!this.observer) {
			// If no observer available (SSR), immediately call callback with true
			// This ensures charts load during SSR/hydration
			callback(true);
			return;
		}

		this.callbacks.set(element, callback);
		this.observer.observe(element);
	}

	/**
	 * Stop observing an element
	 */
	unobserve(element: Element) {
		if (!this.observer) return;

		this.callbacks.delete(element);
		this.observer.unobserve(element);
	}
}

// Create a singleton instance to be shared across the application
export const sharedIntersectionObserver = new SharedIntersectionObserver();

/**
 * Svelte action for intersection observation
 * Usage: <div use:intersect={callback}>
 */
export function intersect(element: HTMLElement, callback: (isVisible: boolean) => void) {
	// Start observing when action is applied
	sharedIntersectionObserver.observe(element, callback);

	return {
		// Cleanup when action is destroyed
		destroy() {
			sharedIntersectionObserver.unobserve(element);
		},

		// Update callback if it changes
		update(newCallback: (isVisible: boolean) => void) {
			sharedIntersectionObserver.unobserve(element);
			sharedIntersectionObserver.observe(element, newCallback);
		}
	};
}
