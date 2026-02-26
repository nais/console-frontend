import { issueTypeLabel } from './issueTypeLabel';

describe('issueTypeLabel', () => {
	test.each([
		['DEPRECATED_INGRESS', 'Deprecated Ingress'],
		['DEPRECATED_REGISTRY', 'Deprecated Registry'],
		['EXTERNAL_INGRESS_CRITICAL_VULNERABILITY', 'Critical Vulnerability'],
		['FAILED_SYNCHRONIZATION', 'Failed Synchronization'],
		['INVALID_SPEC', 'Invalid Spec'],
		['LAST_RUN_FAILED', 'Last Run Failed'],
		['MISSING_SBOM', 'Missing Sbom'],
		['NO_RUNNING_INSTANCES', 'No Running Instances'],
		['OPENSEARCH', 'Opensearch'],
		['SQLINSTANCE_STATE', 'SQL Instance State'],
		['SQLINSTANCE_VERSION', 'SQL Instance Version'],
		['UNLEASH_RELEASE_CHANNEL', 'Unleash Release Channel'],
		['VALKEY', 'Valkey'],
		['VULNERABLE_IMAGE', 'Vulnerable Image']
	])('formats %s to %s', (input, expected) => {
		expect(issueTypeLabel(input)).toBe(expected);
	});
});
