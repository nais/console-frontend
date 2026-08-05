import type { Fields } from '$lib/ui/Form/form';
import { z } from 'zod';

export const serviceAccountForm = [
	{
		type: 'text',
		name: 'name',
		label: 'Service account name',
		inputProps: { required: true },
		characterWidth: 40,
		validation: z.string().min(3, { message: 'Name must be at least 3 characters long' })
	},
	{
		type: 'textarea',
		name: 'description',
		label: 'Description',
		characterWidth: 40,
		rows: 2,
		validation: z.string().min(3, { message: 'Description must be at least 3 characters long' })
	}
] as const satisfies Fields;

/**
 * Binding a workload to a service account. The workload is picked from search results rather than
 * typed, so its identity travels in hidden fields and only has to be present.
 */
const workloadIdentity = [
	{
		type: 'hidden',
		name: 'workloadName',
		validation: z.string().min(1, { message: 'Workload name is required' })
	},
	{
		type: 'hidden',
		name: 'environment',
		validation: z.string().min(1, { message: 'Environment is required' })
	}
] as const satisfies Fields;

/** Team pages, where the owning team is a route param. */
export const addBindingForm = workloadIdentity;

/**
 * Admin pages, where workloads of every team are searchable and there is no team in the route, so
 * the owning team travels with the picked workload.
 */
export const addBindingWithTeamForm = [
	...workloadIdentity,
	{
		type: 'hidden',
		name: 'teamSlug',
		validation: z.string().min(1, { message: 'Team is required' })
	}
] as const satisfies Fields;

/** Removing a binding, confirmed in a dialog, so only the id of the acted-on row is submitted. */
export const removeBindingForm = [
	{
		type: 'hidden',
		name: 'bindingId',
		validation: z.string().min(1, { message: 'Binding ID is required' })
	}
] as const satisfies Fields;
