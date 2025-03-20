import { getImageDisplayName } from './image';

test.each([
	[
		'europe-north1-docker.pkg.dev/nais-management-233d/klage/kabal-e2e-tests',
		'klage/kabal-e2e-tests'
	],
	[
		'europe-north1-docker.pkg.dev/nais-io/nais/images/dataproduct-topics',
		'nais/images/dataproduct-topics'
	]
])('getImageDisplayName(%s)', (name, expected) => {
	expect(getImageDisplayName(name)).toBe(expected);
});
