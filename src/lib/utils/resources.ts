import type { ResourceUtilizationForTeam$result } from '$houdini';
import { PendingValue } from '$houdini';
import bytes from 'bytes-iec';

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

export type ResourceUtilizationListDataType = {
	app: string;
	env: string;
	cpu: number;
	memory: number;
	team: string;
	estimatedAnnualOverageCost: number;
};

export function overageTableData(
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
}
