const qs = require('querystring')
const loaderUtils = require('loader-utils')
const hash = require('hash-sum')
const selfPath = require.resolve('vue-loader')
const vueEntryPath = require.resolve('./vue-entry')
const styleLoaderPath = require.resolve('./style')
const templateLoaderPath = require.resolve('./template')
const scriptLoaderPath = require.resolve('./script')
const configLoaderPath = require.resolve('./config')

const isESLintLoader = (l) => /(\/|\\|@)eslint-loader/.test(l.path)
const isNullLoader = (l) => /(\/|\\|@)null-loader/.test(l.path)
const isCSSLoader = (l) => /(\/|\\|@)css-loader/.test(l.path)
const isPitcher = (l) => l.path !== __filename
const isBabelLoader = (l) => /(\/|\\|@)babel-loader/.test(l.path)

const dedupeESLintLoader = (loaders) => {
	const res = []
	let seen = false
	loaders.forEach((l) => {
		if (!isESLintLoader(l)) {
			res.push(l)
		} else if (!seen) {
			seen = true
			res.push(l)
		}
	})
	return res
}

module.exports = (source) => source

// This pitching loader is responsible for intercepting all vue block requests
// and transform it into appropriate requests.
module.exports.pitch = function(remainingRequest) {
	const options = loaderUtils.getOptions(this)
	const { cacheDirectory, cacheIdentifier } = options
	const query = qs.parse(this.resourceQuery.slice(1))

	let loaders = this.loaders

	// if this is a language block request, eslint-loader may get matched
	// multiple times
	if (query.type) {
		// if this is an inline block, since the whole file itself is being linted,
		// remove eslint-loader to avoid duplicate linting.
		if (/\.vue$/.test(this.resourcePath)) {
			loaders = loaders.filter((l) => !isESLintLoader(l))
		} else {
			// This is a src import. Just make sure there's not more than 1 instance
			// of eslint present.
			loaders = dedupeESLintLoader(loaders)
		}
	}

	// remove self
	loaders = loaders.filter(isPitcher)

	// remove vue entry loader
	loaders = loaders.filter((l) => l.path !== vueEntryPath)

	// do not inject if user uses null-loader to void the type (#1239)
	if (loaders.some(isNullLoader)) {
		return
	}

	const genRequest = (loaders) => {
		// Important: dedupe since both the original rule
		// and the cloned rule would match a source import request.
		// also make sure to dedupe based on loader path.
		// assumes you'd probably never want to apply the same loader on the same
		// file twice.
		const seen = new Map()
		const loaderStrings = []

		loaders.forEach((loader) => {
			const type = typeof loader === 'string' ? loader : loader.path
			const request = typeof loader === 'string' ? loader : loader.request
			if (!seen.has(type)) {
				seen.set(type, true)
				// loader.request contains both the resolved loader path and its options
				// query (e.g. ??ref-0)
				loaderStrings.push(request)
			}
		})

		return loaderUtils.stringifyRequest(
			this,
			'-!' + [ ...loaderStrings, this.resourcePath + this.resourceQuery ].join('!')
		)
	}

	// Inject style-post-loader before css-loader for scoped CSS and trimming
	if (query.type === `style`) {
		const cssLoaderIndex = loaders.findIndex(isCSSLoader)
		if (cssLoaderIndex > -1) {
			const afterLoaders = loaders.slice(0, cssLoaderIndex + 1)
			const beforeLoaders = loaders.slice(cssLoaderIndex + 1)
			const request = genRequest([ ...afterLoaders, styleLoaderPath, ...beforeLoaders ])
			// console.log(request)
			return `import mod from ${request}; export default mod; export * from ${request}`
		}
	}

	// for templates: inject the template compiler & optional cache
	if (query.type === `template`) {
		const path = require('path')
		const cacheLoader =
			cacheDirectory && cacheIdentifier
				? [
						`cache-loader?${JSON.stringify({
							// For some reason, webpack fails to generate consistent hash if we
							// use absolute paths here, even though the path is only used in a
							// comment. For now we have to ensure cacheDirectory is a relative path.
							cacheDirectory: path.isAbsolute(cacheDirectory)
								? path.relative(process.cwd(), cacheDirectory)
								: cacheDirectory,
							cacheIdentifier: hash(cacheIdentifier) + '-vue-loader-template'
						})}`
					]
				: []
		const request = genRequest([ ...cacheLoader, templateLoaderPath + `??vue-loader-options`, ...loaders ])
		// console.log(request)
		// the template compiler uses esm exports
		return `export * from ${request}`
	}

	if (query.type === 'script') {
		const babelLoaderIndex = loaders.findIndex(isBabelLoader)
		if (babelLoaderIndex > -1) {
			const afterLoaders = loaders.slice(0, babelLoaderIndex + 1)
			const beforeLoaders = loaders.slice(babelLoaderIndex + 1)
			const request = genRequest([ ...afterLoaders, scriptLoaderPath, ...beforeLoaders ])
			// console.log(request)
			return `import mod from ${request}; export default mod; export * from ${request}`
		}
	}

	// handle config block
	if (query.type === 'custom' && query.blockType === 'config') {
		const vueLoader = loaders.find((l) => (l.path = selfPath))
		const request = genRequest([ configLoaderPath ].concat(vueLoader ? [ vueLoader ] : []))
		return `import mod from ${request}; export default mod; export * from ${request}`
	}

	// if a custom block has no other matching loader other than vue-loader itself,
	// we should ignore it
	if (query.type === `custom` && loaders.length === 1 && loaders[0].path === selfPath) {
		return ``
	}

	// When the user defines a rule that has only resourceQuery but no test,
	// both that rule and the cloned rule will match, resulting in duplicated
	// loaders. Therefore it is necessary to perform a dedupe here.
	const request = genRequest(loaders)
	return `import mod from ${request}; export default mod; export * from ${request}`
}
