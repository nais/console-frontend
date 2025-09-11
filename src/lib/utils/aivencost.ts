import type {
	OpenSearchSize$options,
	OpenSearchTier$options,
	ValkeySize$options,
	ValkeyTier$options
} from '$houdini';

export const valkeyPlanCosts: Record<ValkeyTier$options, Record<ValkeySize$options, number>> = {
	SINGLE_NODE: {
		RAM_1GB: Infinity,
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
		RAM_4GB: 77,
		RAM_8GB: 154,
		RAM_16GB: 308,
		RAM_32GB: 616,
		RAM_64GB: 1231
	},
	HIGH_AVAILABILITY: {
		RAM_4GB: 235,
		RAM_8GB: 470,
		RAM_16GB: 940,
		RAM_32GB: 1881,
		RAM_64GB: 3763
	}
};
