import { PricingStore } from '$houdini';
import type { ServerLoadEvent } from '@sveltejs/kit';

let cachedPricing: { cpu: number; memory: number } | null = null;

export async function preloadPricing(event: ServerLoadEvent) {
	if (cachedPricing) {
		return cachedPricing;
	}
	console.log('Fetching pricing data');

	const store = new PricingStore();
	const { data } = await store.fetch({ event });

	cachedPricing = {
		cpu: data?.currentUnitPrices.cpu.value ?? 0,
		memory: data?.currentUnitPrices.memory.value ?? 0
	};

	return cachedPricing;
}

export function getCachedPricing() {
	return cachedPricing;
}
