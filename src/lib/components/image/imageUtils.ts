export const joinAliases = (aliases: { name: string; source: string }[], vulnId: string) => {
	return aliases
		.filter((a) => a.name !== vulnId)
		.map((a) => a.name)
		.join(', ');
};

export const detailsUrl = (vulnId: string) => {
	if (vulnId.startsWith('CVE')) {
		return `https://nvd.nist.gov/vuln/detail/${vulnId}`;
	}
	if (vulnId.startsWith('GHSA')) {
		return `https://github.com/advisories/${vulnId}`;
	}
	if (vulnId.startsWith('PYSEC')) {
		return `https://osv.dev/vulnerability/${vulnId}`;
	}
	if (vulnId.startsWith('GO')) {
		return `https://osv.dev/vulnerability/${vulnId}`;
	}
	if (vulnId.startsWith('SNYK')) {
		return `https://snyk.io/vuln/${vulnId}`;
	}
	if (vulnId.startsWith('NSP')) {
		return `https://nodesecurity.io/advisories/${vulnId}`;
	}
	if (vulnId.startsWith('OSSA')) {
		return `https://www.openwall.com/lists/oss-security/2021/09/30/1`;
	}
	if (vulnId.startsWith('MSRC')) {
		return `https://msrc.microsoft.com/update-guide/vulnerability/${vulnId}`;
	}
	if (vulnId.startsWith('USN')) {
		return `https://ubuntu.com/security/notices/${vulnId}`;
	}
	if (vulnId.startsWith('DSA')) {
		return `https://security-tracker.debian.org/tracker/${vulnId}`;
	}
	if (vulnId.startsWith('RUSTSEC')) {
		return `https://rustsec.org/advisories/${vulnId}`;
	}
	if (vulnId.startsWith('UBUNTU')) {
		return `https://ubuntu.com/security/${vulnId.replace(/^UBUNTU-/, '')}`;
	}
	return '';
};
