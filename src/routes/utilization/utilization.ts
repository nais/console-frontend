import { graphql as gql } from '$lib/urql/gql';

export const TenantUtilizationQuery = gql(/* GraphQL */ `
	query TenantUtilization {
		cpuUtil: teamsUtilization(resourceType: CPU) {
			team {
				slug
			}
			requested
			used

			teamEnvironment {
				environment {
					name
				}
			}
		}
		memUtil: teamsUtilization(resourceType: MEMORY) {
			team {
				slug
			}
			requested
			used

			teamEnvironment {
				environment {
					name
				}
			}
		}
		currentUnitPrices {
			cpu {
				value
			}
			memory {
				value
			}
		}
	}
`);
