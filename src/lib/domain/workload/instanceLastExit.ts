interface ExitStatus {
	lastExitReason: string | null;
	lastExitCode: number | null;
	lastExitTimestamp: Date | null;
}

export function instanceLastExit({
	lastExitReason: reason,
	lastExitCode: code,
	lastExitTimestamp: timestamp
}: ExitStatus) {
	if (!reason && code == null && !timestamp) return null;

	const description = code == null ? reason : reason ? `${reason} (code ${code})` : `Code ${code}`;
	return { description, timestamp };
}
