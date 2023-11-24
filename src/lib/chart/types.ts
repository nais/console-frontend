export interface Overage {
	readonly overage: number;
	readonly env: string;
	readonly team: string;
	readonly app: string;
}

export interface Usage {
	readonly timestamp: Date;
	readonly utilization: number;
}

export interface Utilization {
	readonly env: string;
	readonly cpu: Usage[];
	readonly memory: Usage[];
}

export interface ResourceUtilizationApp {
	readonly cpu: {
		readonly timestamp: Date;
		readonly utilization: number;
	}[];
	readonly memory: {
		readonly timestamp: Date;
		readonly utilization: number;
	}[];
}
