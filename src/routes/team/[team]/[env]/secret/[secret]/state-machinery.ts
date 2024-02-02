export type updateState = {
	key: string;
	value: string;
}[];

export type AddKv = {
	type: 'AddKv';
	data: {
		key: string;
		value: string;
	};
};

export type DeleteKv = {
	type: 'DeleteKv';
	data: {
		key: string;
	};
};

export type UndoDeleteKv = {
	type: 'UndoDeleteKv';
	data: {
		key: string;
		value: string;
	};
};

export type UpdateValue = {
	type: 'UpdateValue';
	data: {
		key: string;
		value: string;
	};
};

export type operation = AddKv | DeleteKv | UndoDeleteKv | UpdateValue;

export function mergeChanges(update: updateState, curr: operation): updateState {
	switch (curr.type) {
		case 'AddKv':
			return [...update, { key: curr.data.key, value: curr.data.value }];
		case 'DeleteKv':
			return update.filter((state) => state.key !== curr.data.key);
		case 'UndoDeleteKv':
			return [...update, { key: curr.data.key, value: curr.data.value }];
		case 'UpdateValue':
			return update.map((state) =>
				state.key === curr.data.key ? { key: state.key, value: curr.data.value } : state
			);
		default:
			return update;
	}
}

export function filterAddKvs(ops: operation[]): AddKv[] {
	return ops.filter((op) => op.type === 'AddKv').map((c) => c as AddKv);
}

function filterByKey(key: string, ops: operation[]): operation[] {
	return ops.filter((c) => c.data.key === key);
}

export function lastOperation(key: string, ops: operation[]): operation | undefined {
	return filterByKey(key, ops).at(-1);
}

export function includesOperation(key: string, ops: operation[], type: string): boolean {
	return filterByKey(key, ops).some((c) => c.type === type);
}
