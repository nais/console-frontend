import {
	PendingValue,
	UsageResourceType,
	type TeamResourceUsage$result,
	type TenantUtilization$result,
	type UsageResourceType$options
} from '$houdini';
import bytes from 'bytes-iec';

export function round(value: number, decimals: number = 0): number {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}

// memory should be in Bytes
export function yearlyOverageCost(
	resourceType: UsageResourceType$options,
	request: number,
	utilization: number
) {
	const costPerCpuCorePerYear = 136.69;
	const costPerBytePerYear = 18.71 / 1024 / 1024 / 1024;

	const overage = request - request * (utilization / 100);

	let cost = 0.0;

	if (resourceType == UsageResourceType.CPU) {
		cost = costPerCpuCorePerYear * overage;
	} else {
		cost = costPerBytePerYear * overage;
	}

	return cost > 0.0 ? cost : 0.0;
}

export type utilization = {
	readonly app: {
		readonly name: string;
		readonly env: {
			readonly name: string;
		};
	};
	readonly requested: number;
	readonly used: number;
}[];

export function teamUtilization(data: utilization | undefined) {
	if (data === undefined || data?.length === 0) return 0;
	let totalRequested = 0;
	let totalUsed = 0;
	data.forEach((d) => {
		totalRequested += d.requested;
		totalUsed += d.used;
	});
	return Math.round((totalUsed / totalRequested) * 100);
}

export function cpuUtilization(cpuRequest: number | undefined, totalUsage: number): number {
	if (!cpuRequest) return 0;
	const totalCores = cpuRequest;
	const utilization = (totalUsage / totalCores) * 100;
	return Math.round(utilization * 10 ** 2) / 10 ** 2;
}

export function memoryUtilization(memory: number, totalUsage: number): number {
	const utilization = (totalUsage / memory) * 100;
	return Math.round(utilization * 10 ** 2) / 10 ** 2;
}

export function sumCPURequests(numOfInstances: number, cpuRequest: string): string {
	if (cpuRequest.includes('m')) {
		const cpuRequestInMilliCPU = parseInt(cpuRequest.replace('m', ''));
		const cpuRequestInCPU = cpuRequestInMilliCPU / 1000;
		const totalCPURequest = cpuRequestInCPU * numOfInstances;
		return totalCPURequest.toLocaleString('en-GB', {
			maximumFractionDigits: 3
		});
	} else if (cpuRequest !== '') {
		const totalCPURequest = parseInt(cpuRequest) * numOfInstances;
		return totalCPURequest.toLocaleString('en-GB', {
			maximumFractionDigits: 3
		});
	}
	return '-';
}

export function sumMemoryRequests(numOfInstances: number, memoryRequest: string): string {
	const request = bytes.parse(memoryRequest.concat('B'));
	if (request) {
		if (memoryRequest.includes('i')) {
			const b = bytes(request * numOfInstances, { mode: 'binary' })?.replace('B', '');
			if (b) {
				return b;
			} else {
				return '-';
			}
		}
		const b = bytes(request * numOfInstances)?.replace('B', '');
		if (b) {
			return b;
		} else {
			return '-';
		}
	}
	return '-';
}

export type TeamOverageData = {
	name: string;
	env: string;
	unusedMem: number;
	unusedCpu: number;
	estimatedAnnualOverageCost: number;
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

	return input.memUtil
		.map((memItem) => {
			// Find the corresponding CPU utilization item
			const cpuItem = input.cpuUtil.find(
				(cpu) => cpu.app.name === memItem.app.name && cpu.app.env.name === memItem.app.env.name
			);

			if (!cpuItem) {
				throw new Error(`No corresponding CPU data found for ${memItem.app.name}`);
			}

			// Combine the memory and CPU data into one object
			return {
				name: memItem.app.name,
				env: memItem.app.env.name,
				unusedMem: memItem.requested - memItem.used,
				unusedCpu: cpuItem.requested - cpuItem.used,
				estimatedAnnualOverageCost:
					yearlyOverageCost(
						UsageResourceType.CPU,
						cpuItem.requested,
						cpuItem.used / cpuItem.requested
					) +
					yearlyOverageCost(
						UsageResourceType.MEMORY,
						memItem.requested,
						memItem.used / memItem.requested
					)
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
	team: string;
	unusedMem: number;
	unusedCpu: number;
	estimatedAnnualOverageCost: number;
};

export function mergeCalculateAndSortOverageDataAllTeams(
	input: TenantUtilization$result | null,
	sortedBy: string = 'ENVIROMENT',
	sortDirection: string = 'descending'
): TeamsOverageData[] {
	if (!input) {
		return [];
	}

	return input.memUtil
		.map((memItem) => {
			// Find the corresponding CPU utilization item
			const cpuItem = input.cpuUtil.find((cpu) => cpu.team.slug === memItem.team.slug);

			if (!cpuItem) {
				throw new Error(`No corresponding CPU data found for ${memItem.team.slug}`);
			}

			// Combine the memory and CPU data into one object
			return {
				team: memItem.team.slug,
				unusedMem: memItem.requested - memItem.used,
				unusedCpu: cpuItem.requested - cpuItem.used,
				estimatedAnnualOverageCost:
					yearlyOverageCost(
						UsageResourceType.CPU,
						cpuItem.requested,
						cpuItem.used / cpuItem.requested
					) +
					yearlyOverageCost(
						UsageResourceType.MEMORY,
						memItem.requested,
						memItem.used / memItem.requested
					)
			};
		})
		.sort((a, b) => {
			if (sortedBy === 'TEAM') {
				if (sortDirection === 'descending') {
					if (a.team > b.team) return -1;
					if (a.team < b.team) return 1;
					return 0;
				} else {
					if (a.team > b.team) return 1;
					if (a.team < b.team) return -1;
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
