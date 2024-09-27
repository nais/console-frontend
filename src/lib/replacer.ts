export interface Data {
	[key: string]: string;
}
export const replacer = (routeId: string, params: Data) => {
	return routeId.replace(/\/\(\w+\)/g, '').replace(/\[([^\]]+)\]/g, (_, key) => params[key]);
};
