export function silenceFilter(
	alertName: string,
	namespace: string,
	environmentName: string,
	tenantName: string
): string {
	let clusterName = environmentName;
	if (tenantName === 'nav') {
		if (environmentName === 'dev-gcp') {
			clusterName = 'dev';
		} else if (environmentName === 'prod-gcp') {
			clusterName = 'prod';
		}
	}

	return `{alertname=${JSON.stringify(alertName)},namespace=${JSON.stringify(namespace)},k8s_cluster_name=${JSON.stringify(clusterName)}}`;
}
