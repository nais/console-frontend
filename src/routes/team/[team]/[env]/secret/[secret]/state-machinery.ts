export type updateState = {
	name: string;
	value: string;
}[];

export type AddKv = {
	type: 'AddKv';
	data: {
		name: string;
		value: string;
	};
};

export type DeleteKv = {
	type: 'DeleteKv';
	data: {
		name: string;
	};
};

export type UndoDeleteKv = {
	type: 'UndoDeleteKv';
	data: {
		name: string;
		value: string;
	};
};

export type UpdateValue = {
	type: 'UpdateValue';
	data: {
		name: string;
		value: string;
	};
};

export type operation = AddKv | DeleteKv | UndoDeleteKv | UpdateValue;

export function mergeChanges(update: updateState, curr: operation): updateState {
	switch (curr.type) {
		case 'AddKv':
			return [...update, { name: curr.data.name, value: curr.data.value }];
		case 'DeleteKv':
			return update.filter((state) => state.name !== curr.data.name);
		case 'UndoDeleteKv':
			return [...update, { name: curr.data.name, value: curr.data.value }];
		case 'UpdateValue':
			return update.map((state) =>
				state.name === curr.data.name ? { name: state.name, value: curr.data.value } : state
			);
		default:
			return update;
	}
}

export function filterAddKvs(ops: operation[]): AddKv[] {
	return ops.filter((op) => op.type === 'AddKv').map((c) => c as AddKv);
}

function filterByKey(name: string, ops: operation[]): operation[] {
	return ops.filter((c) => c.data.name === name);
}

export function lastOperation(name: string, ops: operation[]): operation | undefined {
	return filterByKey(name, ops).at(-1);
}

export function includesOperation(name: string, ops: operation[], type: string): boolean {
	return filterByKey(name, ops).some((c) => c.type === type);
}
