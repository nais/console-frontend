import { environmentCluster } from '#lib/utils/environmentCluster.js';

export function silenceFilter(
	alertName: string,
	namespace: string,
	environmentName: string,
	tenantName: string
): string {
	const clusterName = environmentCluster(environmentName, tenantName);

	return `{alertname=${JSON.stringify(alertName)},namespace=${JSON.stringify(namespace)},k8s_cluster_name=${JSON.stringify(clusterName)}}`;
}
