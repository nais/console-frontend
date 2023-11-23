import bytes from 'bytes-iec';

export function sumCPURequests(numOfInstances: number, cpuRequest: string): string {
	if (cpuRequest.includes('m')) {
		const cpuRequestInMilliCPU = parseInt(cpuRequest.replace('m', ''));
		const cpuRequestInCPU = cpuRequestInMilliCPU / 1000;
		const totalCPURequest = cpuRequestInCPU * numOfInstances;
		return totalCPURequest.toLocaleString('en-GB', {
			maximumFractionDigits: 3
		});
	} else {
		const totalCPURequest = parseInt(cpuRequest) * numOfInstances;
		return totalCPURequest.toLocaleString('en-GB', {
			maximumFractionDigits: 3
		});
	}
}

export function sumMemoryRequests(numOfInstances: number, memoryRequest: string): string {
	const request = bytes.parse(memoryRequest.concat('B'));
	let returnVal;

	if (request) {
		if (memoryRequest.includes('i')) {
			returnVal = bytes(request * numOfInstances, { mode: 'binary' })?.replace('B', '');
		}
		returnVal = bytes(request * numOfInstances)?.replace('B', '');
		if (returnVal !== undefined) {
			return returnVal;
		} else {
			return '-';
		}
	}
	return '-';
}
