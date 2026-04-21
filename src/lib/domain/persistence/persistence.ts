import { graphql as gql } from '$lib/urql/gql';

/**
 * Fragment used by `Persistence.svelte` to render the persistence
 * resources (buckets, BigQuery datasets, Cloud SQL, Kafka topic ACLs,
 * OpenSearch, Postgres, Valkey) attached to a workload.
 *
 * The fragment is colocated as a `.ts` module (rather than inline in
 * the `.svelte` file) so callers can import and spread it from their
 * own query documents without dragging the component into a
 * server-only `load` graph.
 */
export const PersistenceFragment = gql(/* GraphQL */ `
	fragment PersistenceFragment on Workload {
		name
		team {
			slug
		}
		teamEnvironment {
			environment {
				name
			}
		}
		bigQueryDatasets {
			edges {
				node {
					id
					name
				}
			}
		}
		buckets {
			edges {
				node {
					id
					name
				}
			}
		}
		kafkaTopicAcls {
			edges {
				node {
					teamName
					access
					workloadName
					topic {
						name
						team {
							slug
						}
						teamEnvironment {
							environment {
								name
							}
						}
					}
				}
			}
		}
		openSearch {
			id
			name
			access {
				edges {
					node {
						access
						workload {
							id
							name
						}
					}
				}
			}
		}
		postgresInstances {
			edges {
				node {
					id
					name
				}
			}
		}
		valkeys {
			edges {
				node {
					id
					name
				}
			}
		}
		sqlInstances {
			edges {
				node {
					id
					name
				}
			}
		}
	}
`);
