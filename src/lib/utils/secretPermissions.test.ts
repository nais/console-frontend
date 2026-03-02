import { getSecretPermissions } from './secretPermissions';

describe('getSecretPermissions', () => {
	test.each([
		{
			viewerIsMember: true,
			isAdmin: false,
			expected: { canMutate: true, canRevealValues: true, canEditValues: true }
		},
		{
			viewerIsMember: false,
			isAdmin: true,
			expected: { canMutate: true, canRevealValues: false, canEditValues: false }
		},
		{
			viewerIsMember: true,
			isAdmin: true,
			expected: { canMutate: true, canRevealValues: true, canEditValues: true }
		},
		{
			viewerIsMember: false,
			isAdmin: false,
			expected: { canMutate: false, canRevealValues: false, canEditValues: false }
		}
	])('returns expected permissions for member=$viewerIsMember admin=$isAdmin', (scenario) => {
		expect(getSecretPermissions(scenario.viewerIsMember, scenario.isAdmin)).toEqual(
			scenario.expected
		);
	});
});
