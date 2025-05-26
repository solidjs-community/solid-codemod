import { Markup } from '../../../data/solid-markup.js'

import {
	log,
	getAttributeNameAndValueFromJSXAttribute,
	getTagNameFromJSXElement,
	warn,
} from '../../shared.js'

/**
 * This transform provides the following "fixes" when reliable
 * possible:
 *
 * 1. Change camelCase attributes to lowercase on known tags (not in
 *    components)
 * 2. Unwrap `attr:` when is not necessary
 * 3. `onsubmit="return false"` -> `attr:onsubmit="return false"`
 * 4. WIP ensure boolean attributes values (for static values)
 * 5. WIP ensure pseudo-boolean attributes values (for static values)
 * 6. Alert of unknown attribute
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
	const j = api.jscodeshift
	const root = j(file.source)

	root.find(j.JSXElement).forEach(path => {
		const tagName = getTagNameFromJSXElement(api, path)

		if (!tagName) throw new Error(`Unknown tagName "${tagName}"`)

		if (!Markup.isKnownTag(tagName)) {
			// skip JSX Components and unknown tags
			return
		}

		const attributes = path.node.openingElement.attributes

		attributes.slice().forEach(attr => {
			if (attr.type === 'JSXAttribute') {
				// get name and value
				let [attributeName, attributeValue] =
					getAttributeNameAndValueFromJSXAttribute(api, attr)

				let isKnownAttribute = Markup.isKnownAttribute(
					tagName,
					attributeName,
				)

				// maybe case needs transform autoFocus` -> `autofocus`
				if (!isKnownAttribute) {
					const newName = attributeName.toLowerCase()

					if (Markup.isKnownAttribute(tagName, newName)) {
						log(
							file,
							`renamed attribute ´${attributeName}´ to ´${newName}´ on tag ´${tagName}´`,
						)
						isKnownAttribute = true
						attributeName = newName
						// attr.name = j.jsxIdentifier(newName)
					}
				}

				// unwrap `attr:autoFocus` -> `autofocus`
				if (Markup.isNamespacedAttrAttribute(attributeName)) {
					const newName = attributeName
						.replace(/^attr:/, '')
						.toLowerCase()

					if (Markup.isKnownAttribute(tagName, newName)) {
						log(
							file,
							`renamed attribute ´${attributeName}´ to ´${newName}´ on tag ´${tagName}´`,
						)
						isKnownAttribute = true
						attributeName = newName
						// attr.name = j.jsxIdentifier(newName)
					}
				}

				// `onsubmit="return false"` -> `attr:onsubmit="return false"`
				if (Markup.isEventListenerAttribute(attributeName)) {
					if (/^on[a-z]/.test(attributeName)) {
						const newName = `attr:${attributeName}`
						log(
							file,
							`renamed attribute ´${attributeName}´ to ´${newName}´ on tag ´${tagName}´`,
						)
						// is all lowercase, so change from onclick to attr:onclick
						attributeName = newName
						// attr.name = j.jsxIdentifier(newName)
					}
				}

				// skips
				if (
					Markup.isDataAttribute(attributeName) ||
					Markup.isNamespacedAttribute(attributeName)
				) {
					return
				}

				// by value change
				if (isKnownAttribute) {
					// boolean to real boolean
					if (Markup.isBooleanAttribute(tagName, attributeName)) {
						warn(file, 'boolean!!', attributeName, attributeValue)

						/*
						if (
						(typeof attributeValue === 'boolean' &&
							attributeValue === true) ||
						attributeValue === '{true}'
					) {
						console.log(
							'boolean found!',
							attributeName,
							attributeValue,
						)
					} else*/
						/*console.log(
							'boolean attribute found!',
							attributeName,
							attributeValue,
						)
						*/
					} else if (
						Markup.isEnumeratedPseudoBooleanAttribute(
							tagName,
							attributeName,
						)
					) {
						console.log(
							'pseudo boolean!',
							attributeName,
							attributeValue,
						)
					} else {
						console.log(attributeValue)
						if (
							(typeof attributeValue === 'string' ||
								typeof attributeValue === 'boolean') &&
							(attributeValue === true ||
								attributeValue === false ||
								attributeValue.includes('true') ||
								attributeValue.includes('false'))
						) {
							warn(
								file,
								`what is this? attribute ´${attributeName}´ on tag ´${tagName}´`,
							)
						}
					}
					// boolean to enumerated pseudo boolean
				} else {
					warn(
						file,
						`unknown attribute ´${attributeName}´ on tag ´${tagName}´`,
					)
				}
			}
		})
	})

	return root.toSource()
}
