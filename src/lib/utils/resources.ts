/**
 * Structural input shapes for the utilization helpers below.
 *
 * These mirror the data the existing `TeamResourceUsage` and
 * `TenantUtilization` queries select, but are declared inline so this
 * module no longer depends on Houdini-generated types. Both the legacy
 * Houdini result shapes and the new urql/codegen result shapes are
 * assignable to these structural types, which keeps the call sites
 * working through the migration.
 */

type WorkloadUtilizationItem = {
	readonly workload: {
		readonly id: string;
		readonly name: string;
		readonly __typename?: string | null;
		readonly teamEnvironment: {
			readonly environment: { readonly name: string };
		};
	};
	readonly requested: number;
	readonly used: number;
};

type CurrentUnitPrices = {
	readonly cpu: { readonly value: number };
	readonly memory: { readonly value: number };
};

export type TeamResourceUsageData = {
	readonly currentUnitPrices: CurrentUnitPrices;
	readonly team: {
		readonly cpuUtil: ReadonlyArray<WorkloadUtilizationItem | null>;
		readonly memUtil: ReadonlyArray<WorkloadUtilizationItem | null>;
	};
};

type TenantUtilizationItem = {
	readonly team: { readonly slug: string };
	readonly requested: number;
	readonly used: number;
};

export type TenantUtilizationData = {
	readonly currentUnitPrices: CurrentUnitPrices;
	readonly cpuUtil: ReadonlyArray<TenantUtilizationItem>;
	readonly memUtil: ReadonlyArray<TenantUtilizationItem>;
};

type ResourceType = 'CPU' | 'MEMORY';

export function round(value: number, decimals: number = 0): number {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}

// memory should be in Bytes
export function yearlyOverageCost(
	resourceType: ResourceType,
	unutilized: number,
	cpuCost: number,
	memCost: number
) {
	const costPerCpuCorePerYear = cpuCost * 8760; // 8760 hours in a year
	const costPerBytePerYear = (memCost / 1024 / 1024 / 1024) * 8760; // convert to GB and multiply by hours in a year

	const cost =
		resourceType === 'CPU' ? costPerCpuCorePerYear * unutilized : costPerBytePerYear * unutilized;

	return cost > 0.0 ? cost : 0.0;
}

export type TeamOverageData = {
	id: string;
	name: string;
	env: string;
	unusedMem: number;
	unusedCpu: number;
	estimatedAnnualOverageCost: number;
	type: string | null | undefined;
};

export type TeamsOverageData = {
	teamSlug: string;
	unusedMem: number;
	unusedCpu: number;
	estimatedAnnualOverageCost: number;
};

export function getTeamOverageData(
	data: TeamResourceUsageData | undefined | null,
	sortedBy: string = 'COST',
	sortDirection: string = 'descending'
): TeamOverageData[] {
	const appMap = new Map<string, TeamOverageData>();
	if (!data) {
		return [];
	}

	// Process CPU
	for (const cpuItem of data.team.cpuUtil) {
		if (!cpuItem) continue;
		const appKey = `${cpuItem.workload.name}-${cpuItem.workload.teamEnvironment.environment.name}`;
		const unutilized = cpuItem.requested - cpuItem.used;
		const unusedCpu = unutilized > 0 ? unutilized : 0;
		if (!appMap.has(appKey)) {
			appMap.set(appKey, {
				id: cpuItem.workload.id,
				name: cpuItem.workload.name,
				env: cpuItem.workload.teamEnvironment.environment.name,
				unusedMem: 0,
				unusedCpu: unusedCpu,
				estimatedAnnualOverageCost: yearlyOverageCost(
					'CPU',
					unusedCpu,
					data.currentUnitPrices.cpu.value,
					data.currentUnitPrices.memory.value
				),
				type: cpuItem.workload.__typename
			});
		} else {
			const current = appMap.get(appKey)!;
			current.unusedCpu += unusedCpu;
			current.estimatedAnnualOverageCost += yearlyOverageCost(
				'CPU',
				unusedCpu,
				data.currentUnitPrices.cpu.value,
				data.currentUnitPrices.memory.value
			);
		}
	}

	// Process Memory
	for (const memItem of data.team.memUtil) {
		if (!memItem) continue;
		const appKey = `${memItem.workload.name}-${memItem.workload.teamEnvironment.environment.name}`;
		const unutilized = memItem.requested - memItem.used;
		const unusedMem = unutilized > 0 ? unutilized : 0;

		if (!appMap.has(appKey)) {
			appMap.set(appKey, {
				id: memItem.workload.id,
				name: memItem.workload.name,
				env: memItem.workload.teamEnvironment.environment.name,
				unusedCpu: 0,
				unusedMem: unusedMem,
				estimatedAnnualOverageCost: yearlyOverageCost(
					'MEMORY',
					unusedMem,
					data.currentUnitPrices.cpu.value,
					data.currentUnitPrices.memory.value
				),
				type: memItem.workload.__typename
			});
		} else {
			const current = appMap.get(appKey)!;
			current.unusedMem += unusedMem;
			current.estimatedAnnualOverageCost += yearlyOverageCost(
				'MEMORY',
				unusedMem,
				data.currentUnitPrices.cpu.value,
				data.currentUnitPrices.memory.value
			);
		}
	}
	return Array.from(appMap.values()).sort((a, b) => {
		if (sortedBy === 'APPLICATION') {
			if (sortDirection === 'descending') {
				if (a.name > b.name) return -1;
				if (a.name < b.name) return 1;
				return 0;
			} else {
				if (a.name > b.name) return 1;
				if (a.name < b.name) return -1;
				return 0;
			}
		} else if (sortedBy === 'ENVIRONMENT') {
			if (sortDirection === 'descending') {
				if (a.env > b.env) return -1;
				if (a.env < b.env) return 1;
				return 0;
			} else {
				if (a.env > b.env) return 1;
				if (a.env < b.env) return -1;
				return 0;
			}
		} else if (sortedBy === 'CPU') {
			if (sortDirection === 'descending') {
				if (a.unusedCpu > b.unusedCpu) return -1;
				if (a.unusedCpu < b.unusedCpu) return 1;
				return 0;
			} else {
				if (a.unusedCpu > b.unusedCpu) return 1;
				if (a.unusedCpu < b.unusedCpu) return -1;
				return 0;
			}
		} else if (sortedBy === 'MEMORY') {
			if (sortDirection === 'descending') {
				if (a.unusedMem > b.unusedMem) return -1;
				if (a.unusedMem < b.unusedMem) return 1;
				return 0;
			} else {
				if (a.unusedMem > b.unusedMem) return 1;
				if (a.unusedMem < b.unusedMem) return -1;
				return 0;
			}
		} else if (sortedBy === 'COST') {
			if (sortDirection === 'descending') {
				if (a.estimatedAnnualOverageCost > b.estimatedAnnualOverageCost) return -1;
				if (a.estimatedAnnualOverageCost < b.estimatedAnnualOverageCost) return 1;
				return 0;
			} else {
				if (a.estimatedAnnualOverageCost > b.estimatedAnnualOverageCost) return 1;
				if (a.estimatedAnnualOverageCost < b.estimatedAnnualOverageCost) return -1;
				return 0;
			}
		}
		return 0;
	});
}

export function getTeamsOverageData(
	data: TenantUtilizationData | null,
	sortedBy: string,
	sortDirection: string
): TeamsOverageData[] {
	const teamMap = new Map<string, TeamsOverageData>();

	if (!data) {
		return [];
	}

	// Process CPU
	for (const cpuItem of data.cpuUtil) {
		const teamKey = `${cpuItem.team.slug}`;
		const unutilized = cpuItem.requested - cpuItem.used;
		const unusedCpu = unutilized > 0 ? unutilized : 0;

		if (!teamMap.has(teamKey)) {
			teamMap.set(teamKey, {
				teamSlug: cpuItem.team.slug,
				unusedMem: 0,
				unusedCpu: unusedCpu,
				estimatedAnnualOverageCost: yearlyOverageCost(
					'CPU',
					unusedCpu,
					data.currentUnitPrices.cpu.value,
					data.currentUnitPrices.memory.value
				)
			});
		} else {
			const current = teamMap.get(teamKey)!;
			current.unusedCpu += unusedCpu;
			current.estimatedAnnualOverageCost += yearlyOverageCost(
				'CPU',
				unusedCpu,
				data.currentUnitPrices.cpu.value,
				data.currentUnitPrices.memory.value
			);
		}
	}

	// Process Memory
	for (const memItem of data.memUtil) {
		const teamKey = `${memItem.team.slug}`;
		const unutilized = memItem.requested - memItem.used;
		const unusedMem = unutilized > 0 ? unutilized : 0;

		if (!teamMap.has(teamKey)) {
			teamMap.set(teamKey, {
				teamSlug: memItem.team.slug,
				unusedCpu: 0,
				unusedMem: unusedMem,
				estimatedAnnualOverageCost: yearlyOverageCost(
					'MEMORY',
					unusedMem,
					data.currentUnitPrices.cpu.value,
					data.currentUnitPrices.memory.value
				)
			});
		} else {
			const current = teamMap.get(teamKey)!;
			current.unusedMem += unusedMem;
			current.estimatedAnnualOverageCost += yearlyOverageCost(
				'MEMORY',
				unusedMem,
				data.currentUnitPrices.cpu.value,
				data.currentUnitPrices.memory.value
			);
		}
	}

	return Array.from(teamMap.values()).sort((a, b) => {
		if (sortedBy === 'TEAM') {
			if (sortDirection === 'descending') {
				if (a.teamSlug > b.teamSlug) return -1;
				if (a.teamSlug < b.teamSlug) return 1;
				return 0;
			} else {
				if (a.teamSlug > b.teamSlug) return 1;
				if (a.teamSlug < b.teamSlug) return -1;
				return 0;
			}
		} else if (sortedBy === 'CPU') {
			if (sortDirection === 'descending') {
				if (a.unusedCpu > b.unusedCpu) return -1;
				if (a.unusedCpu < b.unusedCpu) return 1;
				return 0;
			} else {
				if (a.unusedCpu > b.unusedCpu) return 1;
				if (a.unusedCpu < b.unusedCpu) return -1;
				return 0;
			}
		} else if (sortedBy === 'MEMORY') {
			if (sortDirection === 'descending') {
				if (a.unusedMem > b.unusedMem) return -1;
				if (a.unusedMem < b.unusedMem) return 1;
				return 0;
			} else {
				if (a.unusedMem > b.unusedMem) return 1;
				if (a.unusedMem < b.unusedMem) return -1;
				return 0;
			}
		} else if (sortedBy === 'COST') {
			if (sortDirection === 'descending') {
				if (a.estimatedAnnualOverageCost > b.estimatedAnnualOverageCost) return -1;
				if (a.estimatedAnnualOverageCost < b.estimatedAnnualOverageCost) return 1;
				return 0;
			} else {
				if (a.estimatedAnnualOverageCost > b.estimatedAnnualOverageCost) return 1;
				if (a.estimatedAnnualOverageCost < b.estimatedAnnualOverageCost) return -1;
				return 0;
			}
		}
		return 0;
	});
}
