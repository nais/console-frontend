import { ValkeyMaxMemoryPolicy, ValkeyMemory, ValkeyTier } from '$houdini';
import type { Fields, GroupConfig } from '$lib/ui/Form/form';
import { z } from 'zod';
import {
	maxMemoryPolicyDescription,
	notifyKeyspaceEventsDescription
} from './valkey.snippets.svelte';

export const valkeyGroups: GroupConfig[] = [
	{
		name: 'advanced',
		label: 'Advanced options',
		collapsible: true
	}
];

export const valkeyForm = [
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
		validation: z.string({ message: 'Please select an environment' })
	},
	{
		type: 'select',
		name: 'tier',
		label: 'Tier',
		inputProps: { required: true },
		options: Object.values(ValkeyTier).map((tier) => ({
			value: tier,
			label: (tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()).replace('_', ' ')
		})),
		validation: z.enum(Object.values(ValkeyTier), { message: 'Please select a tier' })
	},
	{
		type: 'select',
		name: 'memory',
		label: 'Memory',
		inputProps: { required: true },
		options: Object.values(ValkeyMemory).map((memory) => ({
			value: memory,
			label: memory.split('_').reverse().join(' ')
		})),
		validation: z.enum(Object.values(ValkeyMemory), { message: 'Please select a memory size' })
	},
	{
		type: 'select',
		name: 'maxMemoryPolicy',
		label: 'Max Memory Policy',
		description: maxMemoryPolicyDescription,
		options: Object.values(ValkeyMaxMemoryPolicy).map((mmp) => ({
			value: mmp
		})),
		validation: z.enum(Object.values(ValkeyMaxMemoryPolicy), {
			message: 'Please select a max memory policy'
		})
	},
	{
		type: 'text',
		name: 'notifyKeyspaceEvents',
		label: 'Notify Keyspace Events',
		group: 'advanced',
		description: notifyKeyspaceEventsDescription,
		inputProps: { placeholder: 'e.g., Ex' },
		validation: z.string().optional()
	},
	{
		type: 'number',
		name: 'databases',
		group: 'advanced',
		description:
			'Default is 16. Minimum 1, maximum 128. Changing this will cause a restart of the Valkey service.',
		label: 'Number of Databases',
		inputProps: { min: '1', max: '128' },
		validation: z.coerce.number().int().min(1).max(128).optional()
	}
] as const satisfies Fields;
