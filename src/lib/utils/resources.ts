import { UsageResourceType, type UsageResourceType$options } from '$houdini';
import bytes from 'bytes-iec';

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
	readonly name: string;
	readonly env: string;
	readonly requested: number;
	readonly used: number;
}[];

export function teamUtilization(data: utilization | undefined) {
	if (data === undefined) return 0;
	let totalRequested = 0;
	let totalUsed = 0;
	data.forEach((d) => {
		totalRequested += d.requested;
		totalUsed += d.used;
	});
	return Math.round((totalUsed / totalRequested) * 100);
}

export function cpuUtilization(
	cpuRequest: string | undefined,
	instanceCount: number,
	totalUsage: number
): number {
	if (!cpuRequest || cpuRequest === '' || instanceCount == 0) return 0;
	const totalCores = cpuCoresFromString(cpuRequest) * instanceCount;
	const utilization = (totalUsage / totalCores) * 100;
	return Math.round(utilization * 10 ** 2) / 10 ** 2;
}

export function cpuCoresFromString(cpu: string): number {
	if (cpu === '') return 0;
	if (cpu.endsWith('m')) {
		const milliCPU = parseInt(cpu.replace('m', ''));
		const cpuCores = milliCPU / 1000;
		return cpuCores;
	}
	return parseInt(cpu);
}

// returns the memory in MB
export function memoryFromString(memory: string): number {
	if (memory === '') return 0;
	const mode = memory.includes('i') ? 'binary' : 'metric';
	const parsed = bytes.parse(memory.concat('B'), { mode }) || 0;
	return Math.round(parsed / (1000 * 1000));
}

export function memoryUtilization(
	memoryString: string,
	instanceCount: number,
	totalUsage: number
): number {
	if (memoryString === '' || instanceCount == 0) return 0;
	const totalMemory = memoryFromString(memoryString) * instanceCount;
	const utilization = (totalUsage / (totalMemory * 1024 * 1024)) * 100;
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

/*export type ResourceUtilizationListDataType = {
	app: string;
	env: string;
	cpu: number;
	memory: number;
	team: string;
	estimatedAnnualOverageCost: number;
};*/

/*export function overageTableData(
	data:
		| ResourceUtilizationForTeam$result['resourceUtilizationOverageForTeam']
		| typeof PendingValue
		| undefined,
	sortedBy: string = 'ENVIROMENT',
	sortDirection: string = 'descending'
): ResourceUtilizationListDataType[] {
	if (data === undefined) return [];
	if (data === PendingValue) return [];
	return data.cpu
		.map((cpu) => {
			const memory = data.memory.filter(
				(s) => s.app === cpu.app && s.env === cpu.env && s.team === cpu.team
			)[0];
			return {
				app: cpu.app,
				env: cpu.env,
				cpu: cpu.overage,
				memory: memory.overage,
				team: cpu.team,
				estimatedAnnualOverageCost:
					cpu.estimatedAnnualOverageCost + memory.estimatedAnnualOverageCost
			};
		})
		.filter((s) => s.estimatedAnnualOverageCost > 0.0)
		.sort((a, b) => {
			if (sortedBy === 'APPLICATION') {
				if (sortDirection === 'descending') {
					if (a.app > b.app) return -1;
					if (a.app < b.app) return 1;
					return 0;
				} else {
					if (a.app > b.app) return 1;
					if (a.app < b.app) return -1;
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
					if (a.cpu > b.cpu) return -1;
					if (a.cpu < b.cpu) return 1;
					return 0;
				} else {
					if (a.cpu > b.cpu) return 1;
					if (a.cpu < b.cpu) return -1;
					return 0;
				}
			} else if (sortedBy === 'MEMORY') {
				if (sortDirection === 'descending') {
					if (a.memory > b.memory) return -1;
					if (a.memory < b.memory) return 1;
					return 0;
				} else {
					if (a.memory > b.memory) return 1;
					if (a.memory < b.memory) return -1;
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
}*/
