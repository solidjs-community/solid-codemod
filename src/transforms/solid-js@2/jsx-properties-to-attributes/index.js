import { Markup } from '../../../data/solid-markup.js'

import {
	log,
	getAttributeNameAndValueFromJSXAttribute,
	getTagNameFromJSXElement,
	warn,
} from '../../shared.js'

/**
 * This transform provides the following when reliable possible:
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
	const j = api.jscodeshift
	const root = j(file.source)

	root.find(j.JSXElement).forEach(path => {
		const tagName = getTagNameFromJSXElement(api, path)

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

				// camcelCase to lowercase transform: tabIndex` -> `tabindex`
				if (!isKnownAttribute) {
					const newName = attributeName.toLowerCase()

					if (Markup.isKnownAttribute(tagName, newName)) {
						log(
							file,
							`renamed attribute ´${attributeName}´ to ´${newName}´ on tag ´${tagName}´`,
						)
						isKnownAttribute = true
						attributeName = newName
						attr.name = j.jsxIdentifier(newName)
					}
				}

				// unwrap `attr:tabIndex` -> `tabindex`
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
						attr.name = j.jsxIdentifier(newName)
					}
				}

				// `onsubmit="return false"` -> `attr:onsubmit="return false"`
				if (Markup.isLowerCaseEventListenerAttribute(attributeName)) {
					if (attributeValue) {
						if (attributeValue.type === 'StringLiteral') {
							const newName = `attr:${attributeName}`
							log(
								file,
								`renamed attribute ´${attributeName}´ to ´${newName}´ on tag ´${tagName}´`,
							)
							isKnownAttribute = true
							attributeName = newName
							attr.name = j.jsxIdentifier(newName)
						}
					}
				}

				// skips
				if (
					Markup.isDataAttribute(attributeName) ||
					Markup.isNamespacedAttribute(attributeName) ||
					Markup.isEventListenerAttribute(attributeName)
				) {
					return
				}

				// by value change

				if (
					isKnownAttribute &&
					Markup.isBooleanAttribute(tagName, attributeName)
				) {
					//  BOOLEANS !

					function getNewValue(value, container = false) {
						// <div autofocus/>
						// <div autofocus={true/false}/>
						if (value === null || value.type === 'BooleanLiteral') {
							return
						}

						// <div autofocus={undefined}/>
						if (
							value.type === 'Identifier' &&
							value.name === 'undefined'
						) {
							return
						}

						// <div autofocus=""/>
						// <div autofocus="true"/>
						// <div autofocus="false"/>
						// <div autofocus="anything"/>
						if (value.type === 'StringLiteral') {
							const val = j.booleanLiteral(
								value.value === 'false' || value.value === '0'
									? false
									: true,
							)
							return container ? j.jsxExpressionContainer(val) : val
						}

						// <div autofocus={0}/>
						// <div autofocus={1}/>
						// <div autofocus={69}/>
						if (value.type === 'NumericLiteral') {
							const val = j.booleanLiteral(
								value.value <= 0 ? false : true,
							)
							return container ? j.jsxExpressionContainer(val) : val
						}
					}

					const newValue = getNewValue(attributeValue, true)

					if (newValue) {
						log(
							file,
							`changed value for ´boolean´ attribute ´${attributeName}´
							on tag ´${tagName}´ from`,
							!attributeValue ? true : attributeValue.value,
							'to',
							newValue.value,
						)
						attr.value = newValue
						return
					}

					// <div autofocus={state?.admin ? "false" : undefined}/>
					if (
						attributeValue &&
						attributeValue.type === 'ConditionalExpression'
					) {
						// consequent
						let newValue = getNewValue(attributeValue.consequent)
						if (newValue) {
							log(
								file,
								`changed condition value for ´boolean´ attribute ´${attributeName}´
								on tag ´${tagName}´ from`,
								attributeValue.consequent.value,
								'to',
								newValue.value,
							)
							attributeValue.consequent = newValue
						}

						// alternate
						newValue = getNewValue(attributeValue.alternate)
						if (newValue) {
							log(
								file,
								`changed condition value for ´boolean´ attribute ´${attributeName}´
								on tag ´${tagName}´ from`,
								attributeValue.alternate.value,
								'to',
								newValue.value,
							)
							attributeValue.alternate = newValue
						}
						return
					}

					// <div autofocus={state?.admin || "false" }/>
					if (
						attributeValue &&
						attributeValue.type === 'LogicalExpression'
					) {
						// left
						let newValue = getNewValue(attributeValue.left)
						if (newValue) {
							log(
								file,
								`changed condition value for ´boolean´ attribute ´${attributeName}´
								on tag ´${tagName}´ from`,
								attributeValue.left.value,
								'to',
								newValue.value,
							)
							attributeValue.left = newValue
						}

						// right
						newValue = getNewValue(attributeValue.right)
						if (newValue) {
							log(
								file,
								`changed condition value for ´boolean´ attribute ´${attributeName}´
								on tag ´${tagName}´ from`,
								attributeValue.right.value,
								'to',
								newValue.value,
							)
							attributeValue.right = newValue
						}
						return
					}

					if (
						attributeValue &&
						attributeValue.type !== 'BooleanLiteral' &&
						attributeValue.type !== 'MemberExpression' &&
						attributeValue.type !== 'CallExpression' &&
						// attributeValue.type !== 'LogicalExpression' &&
						attributeValue.type !== 'ArrowFunctionExpression' &&
						attributeValue.type !== 'FunctionExpression' &&
						attributeValue.type !== 'Identifier' &&
						attributeValue.type !== 'UnaryExpression'
					) {
						warn(file, attributeName, attributeValue)
					}
					return
				}

				if (
					isKnownAttribute &&
					Markup.isEnumeratedPseudoBooleanAttribute(
						tagName,
						attributeName,
					)
				) {
					// PSEUDO BOOLEANS !

					function getNewValue(value, container = false) {
						// <div spellcheck/>
						if (!value) {
							return j.stringLiteral('true')
						}

						// <div spellcheck={undefined}/>
						if (
							value.type === 'Identifier' &&
							value.name === 'undefined'
						) {
							return
						}

						// <div spellcheck="true/false/anything"/>
						if (value.type === 'StringLiteral') {
							return
						}

						// <div spellcheck={true}/>
						// <div spellcheck={false}/>
						if (value.type === 'BooleanLiteral') {
							return j.stringLiteral(
								value.value === true ? 'true' : 'false',
							)
						}
					}

					const newValue = getNewValue(attributeValue)

					if (newValue) {
						log(
							file,
							`changed value for ´pseudo-boolean´ attribute ´${attributeName}´
								on tag ´${tagName}´ from`,
							!attributeValue ? true : attributeValue.value,
							'to',
							newValue.value,
						)
						attr.value = newValue
						return
					}

					// <div spellcheck={state?.admin ? "false" : undefined}/>
					if (
						attributeValue &&
						attributeValue.type === 'ConditionalExpression'
					) {
						// consequent
						let newValue = getNewValue(attributeValue.consequent)
						if (newValue) {
							log(
								file,
								`changed condition value for ´pseudo-boolean´ attribute ´${attributeName}´
									on tag ´${tagName}´ from`,
								attributeValue.consequent.value,
								'to',
								newValue.value,
							)
							attributeValue.consequent = newValue
						}

						// alternate
						newValue = getNewValue(attributeValue.alternate)
						if (newValue) {
							log(
								file,
								`changed condition value for ´pseudo-boolean´ attribute ´${attributeName}´
									on tag ´${tagName}´ from`,
								attributeValue.alternate.value,
								'to',
								newValue.value,
							)
							attributeValue.alternate = newValue
						}
						return
					}

					if (
						attributeValue &&
						attributeValue.type !== 'BinaryExpression' &&
						attributeValue.type !== 'NumericLiteral' &&
						attributeValue.type !== 'StringLiteral' &&
						attributeValue.type !== 'MemberExpression' &&
						attributeValue.type !== 'CallExpression' &&
						// attributeValue.type !== 'LogicalExpression' &&
						attributeValue.type !== 'ArrowFunctionExpression' &&
						attributeValue.type !== 'FunctionExpression' &&
						attributeValue.type !== 'Identifier' &&
						attributeValue.type !== 'UnaryExpression'
					) {
						warn(file, attributeName, attributeValue)
					}
				}

				if (!isKnownAttribute) {
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
