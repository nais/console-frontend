import type {TableSortState} from "@nais/ds-svelte-community";
import type {OrderByField} from "$houdini/graphql";

export const sortTable = (key :string, sortState: TableSortState, fetch: (key: string) => void ) => {
    if (!sortState) {
        sortState = {
            orderBy: key,
            direction: 'descending'
        };
    } else if (sortState.orderBy === key) {
        if (sortState.direction === 'ascending') {
            sortState.direction = 'descending';
        } else {
            sortState.direction = 'ascending';
        }
    } else {
        sortState.orderBy = key;
        if (key === 'NAME') {
            sortState.direction = 'ascending';
        } else {
            sortState.direction = 'descending';
        }
    }

    fetch(key);
    return sortState;
};
