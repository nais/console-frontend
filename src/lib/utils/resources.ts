import bytes from 'bytes-iec';

export function sumCPURequests(numOfInstances: number, cpuRequest: string) {
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

export function sumMemoryRequests(numOfInstances: number, memoryRequest: string) {
	const request = bytes.parse(memoryRequest.concat('B'));
	if (request) {
		if (memoryRequest.includes('i')) {
			return bytes(request * numOfInstances, { mode: 'binary' })?.replace('B', '');
		}
		return bytes(request * numOfInstances)?.replace('B', '');
	}
	return '-';
}
