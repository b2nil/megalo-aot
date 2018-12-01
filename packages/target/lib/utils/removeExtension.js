module.exports = function removeExtension(str, extension) {
	str = str.replace(/\\/g, '/') //  路径统一使用正斜杠 /，避免使用反斜杠 \ 的 windows 路径导致正则匹配规则失效
	if (extension) {
		const reg = new RegExp(extension.replace(/\./, '\\.') + '$')
		return str.replace(reg, '')
	}

	return str.replace(/\.\w+$/g, '')
}
