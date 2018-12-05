const json5 = require('json5')
const toString = Object.prototype.toString

module.exports = function(source) {
	const loaderContext = this

	const entryHelper = loaderContext.megaloEntryHelper

	if (entryHelper.isEntry(loaderContext.resourcePath)) {
		const entryKey = entryHelper.getEntryKey(loaderContext.resourcePath)

		let config

		try {
			// use json5 to ensure that the config is of type [object Object]
			// otherwise the config may always return {}
			config = json5.parse(source)
			if (toString.call(config) !== '[object Object]') {
				config = {}
			}
		} catch (e) {
			config = {}
		}

		loaderContext.megaloCacheToPages({
			file: entryKey,
			config: config
		})
	}
	return ''
}
