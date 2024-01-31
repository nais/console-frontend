import { goto } from '$app/navigation';
import { page } from '$app/stores';
import {
	OrderByField,
	SortOrder,
	type OrderByField$options,
	type SortOrder$options
} from '$houdini';
import type { TableSortState } from '@nais/ds-svelte-community';
import { get } from 'svelte/store';

export const tableGraphDirection = {
	ascending: SortOrder.ASC,
	descending: SortOrder.DESC,
	[SortOrder.ASC]: 'ascending',
	[SortOrder.DESC]: 'descending'
};

export const changeParams = (params: Record<string, string>) => {
	const query = new URLSearchParams(get(page).url.searchParams);
	for (const [key, value] of Object.entries(params)) {
		query.set(key, value);
	}
	goto(`?${query.toString()}`);
};

export const limitOffset = (
	variables: {
		limit?: number | null;
		offset?: number | null;
	} | null
) => {
	if (!variables?.limit) {
		console.warn('limit is not set in graphql query, defaulting to 20');
	}
	return {
		limit: variables?.limit || 20,
		offset: variables?.offset || 0
	};
};

export const tableStateFromVariables = (
	variables: {
		limit?: number | null;
		offset?: number | null;
		orderBy?: {
			direction: SortOrder$options;
			field: string;
		} | null;
	} | null,
	defaultOrderBy: OrderByField$options = OrderByField.STATUS,
	defaultDirection: TableSortState['direction'] = 'ascending'
) => {
	return {
		limit: variables?.limit || 0,
		offset: variables?.offset || 0,
		sortState: variables?.orderBy
			? ({
					orderBy: variables.orderBy.field,
					direction: tableGraphDirection[variables.orderBy.direction]
			  } as TableSortState)
			: ({ orderBy: defaultOrderBy, direction: defaultDirection } as TableSortState)
	};
};

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
