import artifact from '../../../../.houdini/artifacts/CriticalIssueRow';

describe('CriticalIssueRow urgent workload selection', () => {
	test.each(['Application', 'Job'] as const)(
		'selects visible name and typename in the concrete %s fragment for SSR',
		(type) => {
			const workload =
				artifact.selection.abstractFields.fields.ExternalIngressUrgentVulnerabilityIssue.workload
					.selection;

			expect(workload.fields).not.toHaveProperty('name');
			expect(workload.abstractFields.fields[type].name.visible).toBe(true);
			expect(workload.abstractFields.fields[type].__typename.visible).toBe(true);
		}
	);
});
