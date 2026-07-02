import { formatImageRef, getImageDisplayName, parseImage } from './image';

describe('parseImage', () => {
	test.each([
		{
			image: 'ghcr.io/navikt/my-app:latest',
			expected: {
				registry: 'ghcr.io',
				repository: 'navikt',
				name: 'my-app',
				tag: 'latest',
				digest: undefined
			}
		},
		{
			image: 'ghcr.io/navikt/my-app@sha256:cafebabe',
			expected: {
				registry: 'ghcr.io',
				repository: 'navikt',
				name: 'my-app',
				tag: undefined,
				digest: 'sha256:cafebabe'
			}
		},
		{
			image: 'ghcr.io/navikt/my-app:latest@sha256:deadbeef',
			expected: {
				registry: 'ghcr.io',
				repository: 'navikt',
				name: 'my-app',
				tag: 'latest',
				digest: 'sha256:deadbeef'
			}
		},
		{
			image: 'localhost:5000/navikt/my-app:latest@sha256:deadbeef',
			expected: {
				registry: 'localhost:5000',
				repository: 'navikt',
				name: 'my-app',
				tag: 'latest',
				digest: 'sha256:deadbeef'
			}
		}
	])('parseImage($image)', ({ image, expected }) => {
		expect(parseImage(image)).toEqual(expected);
	});

	test('returns empty object for missing image', () => {
		expect(parseImage()).toEqual({});
	});

	test('returns empty object for whitespace-only image', () => {
		expect(parseImage('   ')).toEqual({});
	});

	test.each([
		['ghcr.io/navikt/my-app@deadbeef', 'Could not parse image digest'],
		['ghcr.io/navikt/my-app@@sha256:deadbeef', 'Could not parse image reference'],
		['ghcr.io/navikt/my-app:', 'Could not parse image tag'],
		['ghcr.io/navikt/:latest', 'Could not parse image name'],
		['ghcr.io/navikt/my app:latest', 'Could not parse image reference']
	])('throws predictably for malformed image refs: %s', (image, message) => {
		expect(() => parseImage(image)).toThrow(message);
	});

	test('trims surrounding whitespace before parsing', () => {
		expect(parseImage('  ghcr.io/navikt/my-app:latest@sha256:deadbeef  ')).toEqual({
			registry: 'ghcr.io',
			repository: 'navikt',
			name: 'my-app',
			tag: 'latest',
			digest: 'sha256:deadbeef'
		});
	});
});

describe('formatImageRef', () => {
	test.each([
		{
			name: 'formats tag and digest',
			image: { name: 'ghcr.io/navikt/my-app', tag: 'latest', digest: 'sha256:deadbeef' },
			expected: 'ghcr.io/navikt/my-app:latest@sha256:deadbeef'
		},
		{
			name: 'formats tag without digest',
			image: { name: 'ghcr.io/navikt/my-app', tag: 'latest', digest: null },
			expected: 'ghcr.io/navikt/my-app:latest'
		},
		{
			name: 'formats digest-only image',
			image: { name: 'ghcr.io/navikt/my-app', tag: '', digest: 'sha256:cafebabe' },
			expected: 'ghcr.io/navikt/my-app@sha256:cafebabe'
		},
		{
			name: 'formats image name without tag or digest',
			image: { name: 'ghcr.io/navikt/my-app', tag: undefined, digest: undefined },
			expected: 'ghcr.io/navikt/my-app'
		}
	])('formatImageRef: $name', ({ image, expected }) => {
		expect(formatImageRef(image)).toBe(expected);
	});
});

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
