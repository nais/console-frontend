export const issueTypeLabel = (type: string) => {
	if (type === 'EXTERNAL_INGRESS_CRITICAL_VULNERABILITY') {
		return 'Critical Vulnerability';
	}

	return type
		.split('_')
		.map((part) => {
			if (part === 'SQLINSTANCE') {
				return 'SQL Instance';
			}

			const lower = part.toLowerCase();
			return lower.charAt(0).toUpperCase() + lower.slice(1);
		})
		.join(' ');
};
