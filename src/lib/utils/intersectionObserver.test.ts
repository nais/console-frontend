import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('$app/env', () => ({ browser: true }));

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

describe('intersect', () => {
	test('shares an observer and cleans up each attached element', async () => {
		const observe = vi.fn();
		const unobserve = vi.fn();
		let notify: IntersectionObserverCallback = () => {};
		const constructed = vi.fn();
		class MockIntersectionObserver {
			observe = observe;
			unobserve = unobserve;

			constructor(callback: IntersectionObserverCallback) {
				notify = callback;
				constructed();
			}
		}
		vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

		const { intersect } = await import('./intersectionObserver');
		const first = {} as HTMLElement;
		const second = {} as HTMLElement;
		const onFirst = vi.fn();
		const onSecond = vi.fn();
		const entry = (target: Element, isIntersecting: boolean): IntersectionObserverEntry => ({
			boundingClientRect: {} as DOMRectReadOnly,
			intersectionRatio: Number(isIntersecting),
			intersectionRect: {} as DOMRectReadOnly,
			isIntersecting,
			rootBounds: null,
			target,
			time: 0
		});
		const detachFirst = intersect(onFirst)(first);
		const detachSecond = intersect(onSecond)(second);

		expect(constructed).toHaveBeenCalledTimes(1);
		expect(observe).toHaveBeenCalledWith(first);
		expect(observe).toHaveBeenCalledWith(second);

		notify([entry(first, true), entry(second, false)], {} as IntersectionObserver);
		expect(onFirst).toHaveBeenCalledWith(true);
		expect(onSecond).toHaveBeenCalledWith(false);

		expect(detachFirst).toBeTypeOf('function');
		if (typeof detachFirst === 'function') detachFirst();
		expect(unobserve).toHaveBeenCalledWith(first);
		notify([entry(first, true)], {} as IntersectionObserver);
		expect(onFirst).toHaveBeenCalledTimes(1);
		if (typeof detachSecond === 'function') detachSecond();
		expect(unobserve).toHaveBeenCalledWith(second);
	});

	test('allows loading when IntersectionObserver is unavailable', async () => {
		vi.stubGlobal('IntersectionObserver', undefined);
		const { intersect } = await import('./intersectionObserver');
		const callback = vi.fn();

		intersect(callback)({} as HTMLElement);

		expect(callback).toHaveBeenCalledWith(true);
	});
});
