import {
	OpenSearchSize,
	OpenSearchTier,
	type OpenSearchSize$options,
	type OpenSearchTier$options,
	type ValkeySize$options,
	type ValkeyTier$options
} from '$houdini';

export const valkeyPlanCosts: Record<ValkeyTier$options, Record<ValkeySize$options, number>> = {
	SINGLE_NODE: {
		RAM_1GB: 16, // hobbyist
		RAM_4GB: 64,
		RAM_8GB: 128,
		RAM_14GB: 214,
		RAM_28GB: 394,
		RAM_56GB: 651,
		RAM_112GB: 1277,
		RAM_200GB: 2554
	},
	HIGH_AVAILABILITY: {
		RAM_1GB: 60,
		RAM_4GB: 171,
		RAM_8GB: 342,
		RAM_14GB: 462,
		RAM_28GB: 737,
		RAM_56GB: 1337,
		RAM_112GB: 2640,
		RAM_200GB: 5057
	}
};

export const openSearchPlanCosts: Record<
	OpenSearchTier$options,
	Record<OpenSearchSize$options, number>
> = {
	SINGLE_NODE: {
		RAM_2GB: 16, // hobbyist
		RAM_4GB: 77,
		RAM_8GB: 154,
		RAM_16GB: 308,
		RAM_32GB: 616,
		RAM_64GB: 1231
	},
	HIGH_AVAILABILITY: {
		RAM_2GB: Infinity, // not available
		RAM_4GB: 235,
		RAM_8GB: 470,
		RAM_16GB: 940,
		RAM_32GB: 1881,
		RAM_64GB: 3763
	}
};

export const storageRequirements: Record<
	OpenSearchTier$options,
	Record<OpenSearchSize$options, { min: number; max: number }>
> = {
	[OpenSearchTier.SINGLE_NODE]: {
		[OpenSearchSize.RAM_2GB]: { min: 16, max: 16 },
		[OpenSearchSize.RAM_4GB]: { min: 80, max: 400 },
		[OpenSearchSize.RAM_8GB]: { min: 175, max: 875 },
		[OpenSearchSize.RAM_16GB]: { min: 350, max: 1750 },
		[OpenSearchSize.RAM_32GB]: { min: 700, max: 3500 },
		[OpenSearchSize.RAM_64GB]: { min: 1400, max: 5120 }
	},
	[OpenSearchTier.HIGH_AVAILABILITY]: {
		[OpenSearchSize.RAM_2GB]: { min: 0, max: 0 }, // Not available
		[OpenSearchSize.RAM_4GB]: { min: 240, max: 1200 },
		[OpenSearchSize.RAM_8GB]: { min: 525, max: 2625 },
		[OpenSearchSize.RAM_16GB]: { min: 1050, max: 5250 },
		[OpenSearchSize.RAM_32GB]: { min: 2100, max: 10500 },
		[OpenSearchSize.RAM_64GB]: { min: 4200, max: 15360 }
	}
};
