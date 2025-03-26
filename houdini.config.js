/// <references types="houdini-svelte">

/** @type {import('houdini').ConfigFile} */
const config = {
	defaultPaginateMode: 'SinglePage',
	watchSchema: {
		interval: 0,
		url: 'http://127.0.0.1:3000/graphql',
		headers: {
			'x-user-email': 'andreas@nais.io'
			// cookie: 'session_id='
		}
	},
	plugins: {
		'houdini-svelte': {
			forceRunesMode: true
		}
	},
	scalars: {
		Slug: { type: 'string' },
		Cursor: { type: 'string' },
		Date: {
			type: 'Date',
			unmarshal(val) {
				return new Date(val);
			},
			// turn the value into something the API can use
			marshal(d) {
				if (typeof d === 'string') {
					return d;
				}
				return (
					d.getFullYear() +
					'-' +
					('0' + (d.getMonth() + 1)).slice(-2) +
					'-' +
					('0' + d.getDate()).slice(-2)
				);
			}
		},
		Time: {
			type: 'Date',
			unmarshal(val) {
				return new Date(val);
			},
			// turn the value into something the API can use
			marshal(date) {
				return date.toISOString();
			}
		}
	}
};

export default config;
