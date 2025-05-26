import { Markup } from '../../../data/solid-markup.js'
import {
	getAttributeNameAndValueFromJSXAttribute,
	getTagNameFromJSXElement,
} from '../../shared.js'

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
	const j = api.jscodeshift
	const root = j(file.source)

	root.find(j.JSXElement).forEach(path => {
		const tagName = getTagNameFromJSXElement(path)

		const attributes = path.node.openingElement.attributes

		if (tagName) {
			if (Markup.isKnownTag(tagName)) {
				attributes.forEach(attr => {
					if (attr.type === 'JSXAttribute') {
						const [attributeName, attributeValue] =
							getAttributeNameAndValueFromJSXAttribute(attr)

						if (!Markup.isKnownAttribute(tagName, attributeName)) {
							// fix case
							console.log(
								`Unkown Attribute:\n Name: ${attributeName}, Value: ${attributeValue}`,
							)
						} else {
						}
					}
				})
			}
		} else {
			console.log(tagName)
		}
	})

	return root.toSource()
}
