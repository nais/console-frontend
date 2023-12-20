import { OrderByField } from '$houdini';
import type { TableSortState } from '@nais/ds-svelte-community';

export const sortTable = (key: string, sortState: TableSortState) => {
	if (!sortState) {
		sortState = {
			orderBy: OrderByField[key as keyof typeof OrderByField],
			direction: 'descending'
		};
	} else if (sortState.orderBy === OrderByField[key as keyof typeof OrderByField]) {
		if (sortState.direction === 'ascending') {
			sortState.direction = 'descending';
		} else {
			sortState.direction = 'ascending';
		}
	} else {
		sortState.orderBy = OrderByField[key as keyof typeof OrderByField];
		if (key === OrderByField.NAME) {
			sortState.direction = 'ascending';
		} else {
			sortState.direction = 'descending';
		}
	}
	return sortState;
};
