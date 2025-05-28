import { SolidMarkupV2 } from '../../../data/solid-js@2/solid-markup.js'

import {
	log,
	getAttributeNameAndValueFromJSXAttribute,
	getTagNameFromJSXElement,
} from '../../shared.js'

/**
 * This transform provides the following when reliable possible:
 *
 * - Trasnforms `classList` to `class`
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
	const j = api.jscodeshift
	const root = j(file.source)

	root.find(j.JSXElement).forEach(path => {
		const tagName = getTagNameFromJSXElement(api, path)

		if (!SolidMarkupV2.isKnownTag(tagName)) {
			// skip JSX Components and unknown tags
			return
		}

		const attributes = path.node.openingElement.attributes

		attributes.slice().forEach(attr => {
			if (attr.type === 'JSXAttribute') {
				// get name and value
				let [attributeName, attributeValue] =
					getAttributeNameAndValueFromJSXAttribute(api, attr)

				if (attributeName === 'classList') {
					const newName = 'class'

					log(
						file,
						`renamed attribute ´${attributeName}´ to ´${newName}´ on tag ´${tagName}´`,
					)
					attributeName = newName
					attr.name = j.jsxIdentifier(newName)
				}
			}
		})
	})

	return root.toSource()
}
