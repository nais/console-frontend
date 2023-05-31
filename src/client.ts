import { HoudiniClient } from '$houdini';
import { browser } from '$app/environment';
const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT;
export default new HoudiniClient({
	url: browser || !graphqlEndpoint ? '/query' : graphqlEndpoint

	// uncomment this to configure the network call (for things like authentication)
	// for more information, please visit here: https://www.houdinigraphql.com/guides/authentication
	// fetchParams({ session }) {
	//     return {
	//         headers: {
	//             Authentication: `Bearer ${session.token}`,
	//         }
	//     }
	// }
});
