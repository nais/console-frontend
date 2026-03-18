import { getConfigPermissions } from './configPermissions';

describe('getConfigPermissions', () => {
	test.each([
		{
			viewerIsMember: true,
			isAdmin: false,
			expected: { canMutate: true }
		},
		{
			viewerIsMember: false,
			isAdmin: true,
			expected: { canMutate: true }
		},
		{
			viewerIsMember: true,
			isAdmin: true,
			expected: { canMutate: true }
		},
		{
			viewerIsMember: false,
			isAdmin: false,
			expected: { canMutate: false }
		}
	])('returns expected permissions for member=$viewerIsMember admin=$isAdmin', (scenario) => {
		expect(getConfigPermissions(scenario.viewerIsMember, scenario.isAdmin)).toEqual(
			scenario.expected
		);
	});
});
