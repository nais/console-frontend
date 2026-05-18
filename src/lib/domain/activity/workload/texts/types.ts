type ChangedField = {
	field: string | null | undefined;
	oldValue?: string | null;
	newValue?: string | null;
};

export type WorkloadActivityEntry<T extends string = string> = {
	__typename: T;
	actor: string;
	createdAt: Date;
	message?: string;
	appScaled?: { newSize?: number; direction?: string };
	applicationUpdatedData?: { changedFields?: ChangedField[] };
	jobRunDeletedData?: { runName?: string };
	jobUpdatedData?: { changedFields?: ChangedField[] };
	deploymentData?: { triggerURL?: string };
	resourceType?: string;
	teamSlug?: string;
	environmentName?: string;
	resourceName?: string;
};
