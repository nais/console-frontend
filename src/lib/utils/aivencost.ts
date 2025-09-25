import {
	OpenSearchMemory,
	type OpenSearchMemory$options,
	OpenSearchTier,
	type OpenSearchTier$options,
	type ValkeyMemory$options,
	type ValkeyTier$options
} from '$houdini';

export const valkeyPlanCosts: Record<ValkeyTier$options, Record<ValkeyMemory$options, number>> = {
	SINGLE_NODE: {
		GB_1: 16, // hobbyist
		GB_4: 64,
		GB_8: 128,
		GB_14: 214,
		GB_28: 394,
		GB_56: 651,
		GB_112: 1277,
		GB_200: 2554
	},
	HIGH_AVAILABILITY: {
		GB_1: 60,
		GB_4: 171,
		GB_8: 342,
		GB_14: 462,
		GB_28: 737,
		GB_56: 1337,
		GB_112: 2640,
		GB_200: 5057
	}
};

export const openSearchPlanCosts: Record<
	OpenSearchTier$options,
	Record<OpenSearchMemory$options, number>
> = {
	SINGLE_NODE: {
		GB_2: 16, // hobbyist
		GB_4: 77,
		GB_8: 154,
		GB_16: 308,
		GB_32: 616,
		GB_64: 1231
	},
	HIGH_AVAILABILITY: {
		GB_2: Infinity, // not available
		GB_4: 235,
		GB_8: 470,
		GB_16: 940,
		GB_32: 1881,
		GB_64: 3763
	}
};

export const storageRequirements: Record<
	OpenSearchTier$options,
	Record<OpenSearchMemory$options, { min: number; max: number }>
> = {
	[OpenSearchTier.SINGLE_NODE]: {
		[OpenSearchMemory.GB_2]: { min: 16, max: 16 },
		[OpenSearchMemory.GB_4]: { min: 80, max: 400 },
		[OpenSearchMemory.GB_8]: { min: 175, max: 875 },
		[OpenSearchMemory.GB_16]: { min: 350, max: 1750 },
		[OpenSearchMemory.GB_32]: { min: 700, max: 3500 },
		[OpenSearchMemory.GB_64]: { min: 1400, max: 5120 }
	},
	[OpenSearchTier.HIGH_AVAILABILITY]: {
		[OpenSearchMemory.GB_2]: { min: 0, max: 0 }, // Not available
		[OpenSearchMemory.GB_4]: { min: 240, max: 1200 },
		[OpenSearchMemory.GB_8]: { min: 525, max: 2625 },
		[OpenSearchMemory.GB_16]: { min: 1050, max: 5250 },
		[OpenSearchMemory.GB_32]: { min: 2100, max: 10500 },
		[OpenSearchMemory.GB_64]: { min: 4200, max: 15360 }
	}
};
