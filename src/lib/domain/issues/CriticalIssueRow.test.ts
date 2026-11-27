import artifact from '../../../../.houdini/artifacts/CriticalIssueRow';

test('does not request retired vulnerability issues in the critical row fragment', () => {
	const fields = artifact.selection.abstractFields.fields;
	expect(fields).not.toHaveProperty('ExternalIngressUrgentVulnerabilityIssue');
	expect(fields).not.toHaveProperty('VulnerableImageIssue');
	expect(fields).toHaveProperty('MissingSbomIssue');
});
