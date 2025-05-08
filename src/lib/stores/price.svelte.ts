import { browser } from '$app/environment';
import { PricingStore } from '$houdini';

class PS {
	private initialized = false;
	private prices = { cpu: 0, memory: 0 };
	constructor() {
		this.initialize();
	}
	async initialize() {
		if (this.initialized || !browser) {
			return;
		}
		this.initialized = true;
		const ps = new PricingStore();
		const pricing = await ps.fetch();
		if (pricing.data) {
			this.prices.cpu = pricing.data.currentUnitPrices.cpu.value;
			this.prices.memory = pricing.data.currentUnitPrices.memory.value;
		}
	}

	getCPU(): number {
		return this.prices['cpu'];
	}

	getMEM(): number {
		return this.prices['memory'];
	}
}

export const pricingStore = new PS();
