/**
 * @param {import('jscodeshift').API} api
 * @param {import('jscodeshift').ASTPath<
 * 	import('jscodeshift').JSXElement
 * >} path
 * @returns {string}
 */
export function getTagNameFromJSXElement(api, path) {
	const j = api.jscodeshift

	let tagName

	const nameNode = path.node.openingElement.name

	switch (nameNode.type) {
		case 'JSXIdentifier':
			tagName = nameNode.name
			break
		case 'JSXMemberExpression':
			let parts = []
			let current = nameNode
			while (current.type === 'JSXMemberExpression') {
				parts.unshift(current.property.name)
				current = current.object
			}
			parts.unshift(current.name)
			tagName = parts.join('.')
			break
		case 'JSXNamespacedName':
			tagName = `${nameNode.namespace.name}:${nameNode.name.name}`
			break
		default: {
			throw new Error(`[Unknown Tag Type: ${nameNode.type}]`)
		}
	}

	return tagName
}

/**
 * @param {import('jscodeshift').API} api
 * @param {import('jscodeshift').JSXAttribute} attr
 * @returns {[string, string | boolean]}
 */
export function getAttributeNameAndValueFromJSXAttribute(api, attr) {
	const j = api.jscodeshift

	let attributeName
	let attributeValue

	const nameNode = attr.name
	const valueNode = attr.value

	if (nameNode.type === 'JSXIdentifier') {
		attributeName = nameNode.name
	} else if (nameNode.type === 'JSXNamespacedName') {
		attributeName = `${nameNode.namespace.name}:${nameNode.name.name}`
	} else {
		throw new Error(`[Unknown Attribute Type: ${nameNode.type}]`)
	}

	if (valueNode) {
		// TODO figure out the best value to return
		if (valueNode.type === 'JSXExpressionContainer') {
			attributeValue = valueNode.expression.value
		} else {
			attributeValue = valueNode.value
		}
	} else {
		attributeValue = true
	}

	return [attributeName, attributeValue]
}

/** Pretty print transform changes */
const messages = {}

/**
 * Pretty print transform log
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {...any} message
 */
export function log(file, ...message) {
	const fileName = file.path || 'Unknown'
	messages[fileName] = messages[fileName] || []
	messages[fileName].push(message.join(' '))
}
/**
 * Pretty print transform warn
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {...any} message
 */
export function warn(file, ...message) {
	log(file, `\x1b[33m${message.join(' ')}\x1b[0m`)
}

process.on('exit', () => {
	for (const file in messages) {
		console.log(`\x1b[32m${file}\x1b[0m`)
		console.log(messages[file].map(x => '- ' + x).join('\n'))
	}
})
