/**
 * @param {import('jscodeshift').ASTPath<
 * 	import('jscodeshift').JSXElement
 * >} path
 * @returns {string}
 */
export function getTagNameFromJSXElement(path) {
	const openingElement = path.node.openingElement

	const tagNameNode = openingElement.name

	let tagName

	switch (tagNameNode.type) {
		case 'JSXIdentifier':
			tagName = tagNameNode.name
			break
		case 'JSXMemberExpression':
			let parts = []
			let current = tagNameNode
			while (current.type === 'JSXMemberExpression') {
				parts.unshift(current.property.name)
				current = current.object
			}
			parts.unshift(current.name)
			tagName = parts.join('.')
			break
		case 'JSXNamespacedName':
			tagName = `${tagNameNode.namespace.name}:${tagNameNode.name.name}`
			break
		default: {
			throw new Error(`[Unknown Tag Type: ${tagNameNode.type}]`)
		}
	}

	return tagName
}

/**
 * @param {import('jscodeshift').JSXAttribute} attr
 * @returns {[string, string]}
 */
export function getAttributeNameAndValueFromJSXAttribute(attr) {
	let attributeName
	let attributeValue

	const name = attr.name
	const value = attr.value

	if (name.type === 'JSXIdentifier') {
		attributeName = name.name
	} else if (name.type === 'JSXNamespacedName') {
		attributeName = `${name.namespace.name}:${name.name.name}`
	}

	if (value) {
		if (value.type === 'JSXExpressionContainer') {
			attributeValue = j(value).toSource()
		} else {
			attributeValue = value.value
		}
	} else {
		attributeValue = true
	}

	return [attributeName, attributeValue]
}
