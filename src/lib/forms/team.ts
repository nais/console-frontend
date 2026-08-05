import type { Fields } from '$lib/ui/Form/form';
import { z } from 'zod';

const reservedSlugs = [
	'nais-system',
	'kube-system',
	'kube-node-lease',
	'kube-public',
	'kyverno',
	'cnrm-system',
	'configconnector-operator-system',
	'default'
];

const slugPattern = /^[a-z](?:[a-z0-9]|-(?=[a-z0-9]))*$/;
const slackChannelPattern = /^#[a-zæåø0-9_-]{1,80}$/;

export const createTeamForm = [
	{
		type: 'text',
		name: 'slug',
		label: 'Identifier / Name',
		description:
			'Example: my-team-name. It is not possible to change the identifier after creation, so choose wisely.',
		inputProps: { required: true, autocomplete: 'off' },
		validation: z
			.string()
			.trim()
			.min(3, { message: 'A team slug must be at least 3 characters long.' })
			.max(30, { message: 'A team slug must be at most 30 characters long.' })
			.regex(slugPattern, {
				message:
					'A team slug must begin with a lowercase letter and may include lowercase letters, numbers, and hyphens. However, it cannot start or end with a hyphen, nor can it contain consecutive hyphens.'
			})
			.refine((slug) => !reservedSlugs.includes(slug), { message: 'This slug is reserved.' })
			.refine((slug) => !slug.startsWith('nais'), {
				message:
					"The name prefix 'nais' is reserved. Try again with a different name, perhaps just removing the prefix?"
			})
			.refine((slug) => !slug.startsWith('team'), {
				message:
					"The name prefix 'team' is redundant. When you create a team, it is by definition a team. Try again with a different name, perhaps just removing the prefix?"
			})
	},
	{
		type: 'text',
		name: 'purpose',
		label: 'Purpose of the team',
		description: 'Example: Making sure users have a good experience',
		inputProps: { required: true, autocomplete: 'off' },
		validation: z
			.string()
			.trim()
			.min(3, { message: 'The purpose must be at least 3 characters long.' })
	},
	{
		type: 'text',
		name: 'slackChannel',
		label: 'Slack channel',
		description: 'Example: #my-team-slack',
		inputProps: { required: true, placeholder: '#my-team-slack', autocomplete: 'off' },
		// The leading # is part of the value the API stores, so it is required rather than added
		// behind the user's back while they type.
		validation: z.string().trim().regex(slackChannelPattern, {
			message:
				'A Slack channel starts with # and may contain only lowercase letters, numbers, hyphens and underscores, up to 80 characters.'
		})
	}
] as const satisfies Fields;
