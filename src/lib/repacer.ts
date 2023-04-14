interface Data {
	[key: string]: string;
}
export const replacer = (routeId: string, params: Data) => {
	return routeId.replace(/\[([^\]]+)\]/g, (_, key) => params[key]);
};
