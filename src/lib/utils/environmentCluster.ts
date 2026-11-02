export function environmentCluster(environment: string, tenant: string): string {
	if (tenant === 'nav') {
		if (environment === 'dev-gcp') return 'dev';
		if (environment === 'prod-gcp') return 'prod';
	}
	return environment;
}
