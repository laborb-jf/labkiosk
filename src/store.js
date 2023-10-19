import Store from 'electron-store'

const store = new Store({
	watch: true, // watch config changes https://github.com/sindresorhus/electron-store#watch
	schema: {
		settings: {
			type: 'object',
			properties: {
				url: {
					type: 'string',
					default: 'https://laborb.de'
				},
				autoLoad: {
					type: 'boolean',
					default: false
				},
				dark: {
					type: 'boolean',
					default: false
				},
				cacheLimit: {
					type: 'number',
					default: 500
				},
				autoReload: {
					type: 'boolean',
					default: true
				},
				autoReloadMode: {
					type: 'string',
					default: 'every'
				},
				autoReloadHour: {
					type: 'number',
					default: 0
				},
				autoReloadEvery: {
					type: 'string',
					default: '1m'
				}
			}
		}
	},
	defaults: {
		settings: {
			url: 'https://laborb.de',
			autoLoad: false,
			dark: false,
			cacheLimit: 500,
			autoReload: true,
			autoReloadMode: 'every',
			autoReloadHour: 0, // midnight
			autoReloadEvery: '10s'
		}
	}
})

export default store
