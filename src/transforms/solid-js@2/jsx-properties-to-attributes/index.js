import { isValidAttribute, isValidTag } from '../../shared.js'

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
	const j = api.jscodeshift
	const root = j(file.source)

	root.find(j.JSXElement).forEach(path => {
		const openingElement = path.node.openingElement

		// TAG

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
				tagName = `[Unknown Tag Type: ${tagNameNode.type}]`
			}
		}

		// ATTRIBUTES

		const attributes = openingElement.attributes

		if (tagName) {
			if (isValidTag(tagName)) {
				attributes.forEach(attr => {
					if (attr.type === 'JSXAttribute') {
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

						if (!isValidAttribute(tagName, attributeName)) {
							console.log(
								`Attribute Name: ${attributeName}, Attribute Value: ${attributeValue}`,
							)
						}
					}
				})
			}
		}
	})

	return root.toSource()
}
