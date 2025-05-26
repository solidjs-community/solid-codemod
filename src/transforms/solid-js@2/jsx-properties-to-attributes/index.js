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
		const tagName = getTagNameFromJSXElement(api, path)

		const attributes = path.node.openingElement.attributes

		if (tagName) {
			if (Markup.isKnownTag(tagName)) {
				attributes.forEach(attr => {
					if (attr.type === 'JSXAttribute') {
						let [attributeName, attributeValue] =
							getAttributeNameAndValueFromJSXAttribute(api, attr)

						if (!Markup.isKnownAttribute(tagName, attributeName)) {
							// fix case
							// classList to class
							console.log(
								`Unkown Attribute:\n Name: ${attributeName}, Value: ${attributeValue}`,
							)
						} else {
							// boolean to real boolean
							// boolean to enumerated pseudo boolean
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
