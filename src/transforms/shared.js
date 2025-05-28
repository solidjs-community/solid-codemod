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
 * Returns tuple with attribute name as string. and for value it
 * unwraps expressions.
 *
 * @param {import('jscodeshift').API} api
 * @param {import('jscodeshift').JSXAttribute} attr
 * @returns {[
 * 	string,
 * 	import('jscodeshift').Expression | undefined | null,
 * ]}
 */
export function getAttributeNameAndValueFromJSXAttribute(api, attr) {
	const j = api.jscodeshift

	let attributeName
	let attributeValue

	const nameNode = attr.name
	const valueNode = attr.value

	// name
	if (nameNode.type === 'JSXIdentifier') {
		attributeName = nameNode.name
	} else if (nameNode.type === 'JSXNamespacedName') {
		attributeName = `${nameNode.namespace.name}:${nameNode.name.name}`
	} else {
		throw new Error(`[Unknown Attribute Type: ${nameNode.type}]`)
	}

	// value
	attributeValue = valueNode
	// .expression is unwrapped
	while (
		attributeValue &&
		attributeValue.type === 'JSXExpressionContainer'
	) {
		attributeValue = attributeValue.expression
	}

	return [attributeName, attributeValue]
}

/** Pretty print transform changes */
const messages = {}

function print(file, color, message) {
	const fileName = file.path || 'Unknown'
	messages[fileName] = messages[fileName] || []
	messages[fileName].push({ color, message })
}

/**
 * Pretty print transform log for N arguments
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {...any} message
 */
export function log(file, ...message) {
	print(file, 'log', message)
}
/**
 * Pretty print transform warn for N arguments
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {...any} message
 */
export function warn(file, ...message) {
	print(file, 'warn', message)
}

function orange(string) {
	console.log(`\x1b[33m${string}\x1b[0m`)
}
function blue(string) {
	console.log(`\x1b[94m${string}\x1b[0m`)
}
process.on('exit', () => {
	for (const fileName in messages) {
		blue(fileName)

		for (const message of messages[fileName]) {
			// strings
			const newMessages = message.message.map(x =>
				typeof x === 'string'
					? x === ''
						? '""'
						: x === 'true' || x === 'false' || x === '0' || x === '1'
							? '"' + x + '"'
							: x
					: typeof x === 'boolean' || typeof x === 'number'
						? '´' + x + '´'
						: x,
			)
			const stringMessages = newMessages
				.filter(x => typeof x === 'string')
				.join(' ')
				.replace(/\s+/g, ' ')
				.trim()

			if (stringMessages) {
				if (message.color === 'warn') {
					orange(` - ${stringMessages}`)
				} else {
					console.log(' - ' + stringMessages)
				}
			}

			// objects
			newMessages.forEach(
				x => typeof x !== 'string' && console.log(x),
			)
		}
	}
})
