export const appSpec = {
	status: 'status',
	image: 'image',
	version: '1.5.2',
	replicas: 'replicas',
	instances: [
		{ name: 'container1', status: 'running' },
		{ name: 'container2', status: 'running' },
		{ name: 'container3', status: 'not running', reason: 'everything is shit!' }
	],
	network: {
		inbound: {
			rules: [{ application: 'app1' }, { application: 'app2', namespace: 'different' }]
		},
		outbound: {
			rules: [{ application: 'app-b', namespace: 'namespace-b' }],
			external: [{ host: 'google.com' }]
		}
	},
	logs: [
		'{"@timestamp":"2023-04-12T10:42:52.649+02:00","@version":1,"message":"request rewrite: /varselinnboks/internal/isAlive -> /internal/isAlive","logger_name":"no.nav.sbl.dialogarena.varselinnboks.context.RemovePathServlet","thread_name":"qtp1992801971-17","level":"INFO","level_value":20000,"callId":"5d4a025faad24e49a2da43674a90c0b3","requestId":"f02c2a003f8a4e68a9cbe8940c6466b2"}',
		'{"@timestamp":"2023-04-12T10:42:52.649+02:00","@version":1,"message":"request rewrite: /varselinnboks/internal/isAlive -> /internal/isAlive","logger_name":"no.nav.sbl.dialogarena.varselinnboks.context.RemovePathServlet","thread_name":"qtp1992801971-15","level":"INFO","level_value":20000,"callId":"ef526dfafdd84ea1a1a8dbd44b5ab4e1","requestId":"e31aa09558874369a75a613eeee29c9a"}',
		'{"@timestamp":"2023-04-12T10:42:52.650+02:00","@version":1,"message":"status=200, method=GET, host=10.6.97.78, path=/varselinnboks/internal/isAlive","logger_name":"no.nav.log.LogFilter","thread_name":"qtp1992801971-15","level":"INFO","level_value":20000,"callId":"ef526dfafdd84ea1a1a8dbd44b5ab4e1","requestId":"e31aa09558874369a75a613eeee29c9a","path":"/varselinnboks/internal/isAlive","method":"GET","host":"10.6.97.78","status":"200"}',
		'{"@timestamp":"2023-04-12T10:42:52.650+02:00","@version":1,"message":"status=200, method=GET, host=10.6.97.78, path=/varselinnboks/internal/isAlive","logger_name":"no.nav.log.LogFilter","thread_name":"qtp1992801971-17","level":"INFO","level_value":20000,"callId":"5d4a025faad24e49a2da43674a90c0b3","requestId":"f02c2a003f8a4e68a9cbe8940c6466b2","path":"/varselinnboks/internal/isAlive","method":"GET","host":"10.6.97.78","status":"200"}'
	],
	cpu: 'cpu',
	last_deployed: Date.now(),
	memory: 'memory',
	disk: 'disk',
	ingress: ['appname.intern.nav.no', 'appname.nav.no'],
	created: Date.now(),
	updated: 'updated',
	restarts: 'restarts',
	yaml: 'yaml',
	gcp: {
		bigQueryDatasets: [
			{ name: 'my_bigquery_dataset', description: 'my bigquery dataset description' },
			{ name: 'my_bigquery_dataset2', description: 'my bigquery dataset description2' }
		],
		buckets: [{ name: 'my_bucket', cascadingDelete: true }],
		sqlInstances: [{ name: 'my_sql_instance', type: 'POSTGRES_12', tier: 'db-f1-micro' }]
	},
	kafka: {
		pool: 'nav-dev',
		streams: true
	},
	openSearch: {
		instance: 'my-opensearch-instance'
	},
	azure: {
		application: {
			allowAllUsers: true
		}
	},
	idporten: {
		enabled: true
	},
	maskinporten: {
		enabled: true
	},
	vault: {
		enabled: true
	}
};
