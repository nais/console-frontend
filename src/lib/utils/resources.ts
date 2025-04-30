import {
	PendingValue,
	UtilizationResourceType,
	type TeamResourceUsage$result,
	type TenantUtilization$result,
	type UtilizationResourceType$options
} from '$houdini';

export function round(value: number, decimals: number = 0): number {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}

// memory should be in Bytes
export function yearlyOverageCost(
	resourceType: UtilizationResourceType$options,
	unutilized: number
) {
	// TODO: should be provided by Nais API
	const costPerCpuCorePerYear = 0.022258158 * 8760; // 8760 hours in a year
	const costPerBytePerYear = (0.00298259 / 1024 / 1024 / 1024) * 8760;

	let cost = 0.0;

	if (resourceType == UtilizationResourceType.CPU) {
		cost = costPerCpuCorePerYear * unutilized;
	} else {
		cost = costPerBytePerYear * unutilized;
	}

	return cost > 0.0 ? cost : 0.0;
}

export type utilization = (
	| typeof PendingValue
	| {
			readonly requested: number;
			readonly used: number;
			readonly workload: {
				readonly name: string;
				readonly teamEnvironment: {
					readonly environment: {
						readonly name: string;
					};
				};
			};
	  }
)[];

export function teamUtilization(data: utilization | undefined) {
	if (data === undefined) return 0;
	let totalRequested = 0;
	let totalUsed = 0;
	data.forEach((d) => {
		if (d === PendingValue) {
			totalRequested += 0;
			totalUsed += 0;
		} else {
			totalRequested += d.requested;
			totalUsed += d.used;
		}
	});
	return Math.round((totalUsed / totalRequested) * 100);
}

export type TeamOverageData = {
	id: string;
	name: string;
	env: string;
	unusedMem: number;
	unusedCpu: number;
	estimatedAnnualOverageCost: number;
	type: string | null;
};

export function mergeCalculateAndSortOverageData(
	input: TeamResourceUsage$result['team'] | typeof PendingValue | undefined,
	sortedBy: string = 'ENVIROMENT',
	sortDirection: string = 'descending'
): TeamOverageData[] {
	if (!input) {
		return [];
	}
	if (input === PendingValue) {
		return [];
	}

	const memUtil = input.memUtil.filter((memItem) => memItem) as NonNullable<
		(typeof input.memUtil)[0]
	>[];

	return memUtil
		.map((memItem) => {
			const cpuItem = input.cpuUtil.find(
				(cpu) =>
					cpu &&
					cpu.workload.name === memItem.workload.name &&
					cpu.workload.teamEnvironment.environment.name ===
						memItem.workload.teamEnvironment.environment.name
			);

			if (!cpuItem) {
				throw new Error(`No corresponding CPU data found for ${memItem.workload.name}`);
			}
			const unutilizedMem = memItem.requested - memItem.used;
			const unutilizedCpu = cpuItem.requested - cpuItem.used;

			const estimatedAnnualOverageCost =
				yearlyOverageCost(UtilizationResourceType.CPU, unutilizedCpu) +
				yearlyOverageCost(UtilizationResourceType.MEMORY, unutilizedMem);

			// Combine the memory and CPU data into one object
			return {
				id: memItem.workload.id,
				name: memItem.workload.name,
				env: memItem.workload.teamEnvironment.environment.name,
				unusedMem: memItem.requested - memItem.used,
				unusedCpu: cpuItem.requested - cpuItem.used,
				estimatedAnnualOverageCost: estimatedAnnualOverageCost,
				type: memItem.workload.__typename as string | null
			};
		})
		.sort((a, b) => {
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

export type TeamsOverageData = {
	teamSlug: string;
	unusedMem: number;
	unusedCpu: number;
	estimatedAnnualOverageCost: number;
};

export function cpuUtilization(cpuRequest: number | undefined, currentCpuUsage: number): number {
	if (!cpuRequest) return 0;
	const utilization = (currentCpuUsage / cpuRequest) * 100;
	return Math.round(utilization * 10 ** 2) / 10 ** 2;
}

export function memoryUtilization(requestedMemory: number, currentMemoryUsage: number): number {
	if (!requestedMemory) return 0;
	return currentMemoryUsage / requestedMemory;
}

export function getTeamsOverageData(
	data: TenantUtilization$result | null,
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
				estimatedAnnualOverageCost: yearlyOverageCost('CPU', unusedCpu)
			});
		} else {
			const current = teamMap.get(teamKey)!;
			current.unusedCpu += unusedCpu;
			current.estimatedAnnualOverageCost += yearlyOverageCost('CPU', unusedCpu);
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
				estimatedAnnualOverageCost: yearlyOverageCost('MEMORY', unusedMem)
			});
		} else {
			const current = teamMap.get(teamKey)!;
			current.unusedMem += unusedMem;
			current.estimatedAnnualOverageCost += yearlyOverageCost('MEMORY', unusedMem);
		}
	}

	console.log('teamMap', teamMap);

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
