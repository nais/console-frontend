import {
	OpenSearchMajorVersion,
	OpenSearchMemory,
	type OpenSearchMemory$options,
	OpenSearchTier,
	type OpenSearchTier$options
} from '$houdini';
import type { Fields, Option } from '$lib/ui/Form/form';
import { openSearchPlanCosts, storageRequirements } from '$lib/utils/aivencost';
import { z } from 'zod';

const isAvailable = (tier: OpenSearchTier$options, memory: OpenSearchMemory$options) =>
	Number.isFinite(openSearchPlanCosts[tier]?.[memory]);

const availableMemories = (tier: OpenSearchTier$options): OpenSearchMemory$options[] =>
	Object.values(OpenSearchMemory).filter((memory) => isAvailable(tier, memory));

const memoryLabel = (memory: OpenSearchMemory$options) => memory.split('_').reverse().join(' ');

export const openSearchForm = [
	{
		type: 'text',
		name: 'name',
		label: 'Instance name',
		createOnly: true,
		inputProps: { required: true },
		validation: z.string().min(3, { message: 'Name must be at least 3 characters long' })
	},
	{
		type: 'select',
		name: 'environmentName',
		label: 'Environment',
		createOnly: true,
		inputProps: { required: true },
		validation: z.string().min(1, { message: 'Please select an environment' })
	},
	{
		type: 'select',
		name: 'version',
		label: 'Desired version',
		inputProps: { required: true },
		options: Object.values(OpenSearchMajorVersion).map((version) => ({ value: version })),
		validation: z.enum(Object.values(OpenSearchMajorVersion), {
			message: 'Please select a version'
		})
	},
	{
		type: 'select',
		name: 'tier',
		label: 'Tier',
		inputProps: { required: true },
		options: Object.values(OpenSearchTier).map((tier) => ({
			value: tier,
			label: (tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()).replace('_', ' ')
		})),
		validation: z.enum(Object.values(OpenSearchTier), { message: 'Please select a tier' })
	},
	{
		type: 'select',
		name: 'memory',
		label: 'Memory',
		inputProps: { required: true },
		// Not every memory size is offered on every tier.
		dynamic: (values): { options: Option[] } => ({
			options: availableMemories(values.tier as OpenSearchTier$options).map((memory) => ({
				value: memory,
				label: memoryLabel(memory)
			}))
		}),
		validation: z.enum(Object.values(OpenSearchMemory), { message: 'Please select a memory size' })
	},
	{
		type: 'number',
		name: 'storageGB',
		label: 'Storage (GB)',
		characterWidth: 7,
		inputProps: { required: true },
		// Allowed storage range and granularity follow from the chosen tier and memory.
		dynamic: (values) => {
			const requirements =
				storageRequirements[values.tier as OpenSearchTier$options]?.[
					values.memory as OpenSearchMemory$options
				];

			if (!requirements) return {};

			const { min, max, increments } = requirements;
			return {
				inputProps: { min, max, step: increments, readonly: min === max },
				description:
					min === max
						? `Storage is fixed at ${min} GB for this tier and memory.`
						: `Available storage: ${min} - ${max} GB, in increments of ${increments} GB.`
			};
		},
		validation: z.coerce
			.number({ message: 'Storage must be a number of GB' })
			.int({ message: 'Storage must be a whole number of GB' })
			.min(1, { message: 'Storage must be at least 1 GB' })
	}
] as const satisfies Fields;
