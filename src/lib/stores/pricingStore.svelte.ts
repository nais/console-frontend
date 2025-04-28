import { browser } from '$app/environment';

type ResourceType = 'CPU' | 'MEM';

export interface PricingEntry {
	skuId: string;
	price: number;
	type: ResourceType;
	currency: string;
}

class PricingStore {
	private initialized = false;
	private prices = new Map<ResourceType, PricingEntry>();

	async initialize() {
		console.log('Initializing pricing store...');

		if (this.initialized || !browser) return;
		this.initialized = true;

		const response = await fetch(`/api/pricing`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				currency: 'EUR',
				skuIds: [
					'0981-D144-B18E', // CPU
					'779E-BED5-F31F' // MEM
				]
			})
		});

		if (!response.ok) {
			console.error('Failed to fetch pricing:', response.statusText);
			return;
		}

		const pricingList: PricingEntry[] = await response.json();

		for (const entry of pricingList) {
			this.prices.set(entry.type, entry);
		}
	}

	getCPU(): PricingEntry | undefined {
		return this.prices.get('CPU');
	}

	getMEM(): PricingEntry | undefined {
		return this.prices.get('MEM');
	}
}

export const pricingStore = new PricingStore();
