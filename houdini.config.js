/// <references types="houdini-svelte">

/** @type {import('houdini').ConfigFile} */
const config = {
	watchSchema: {
		url: 'http://127.0.0.1:4242/query'
	},
	plugins: {
		'houdini-svelte': {}
	},
	scalars: {
		Time: {
			type: 'Date',
			unmarshal(val) {
				return new Date(val);
			},
			// turn the value into something the API can use
			marshal(date) {
				return date.toString();
			}
		}
	}
};

export default config;
