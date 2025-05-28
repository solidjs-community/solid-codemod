import solid from './jsx.json' with { type: 'json' }

// https://github.com/ryansolid/dom-expressions/blob/next/packages/dom-expressions/src/jsx-h.d.ts#L795
// `global.autofocus` is boolean so we can assume all other booleans have the same type
const BooleanAttribute = solid.attributes.global.autofocus

export const SolidMarkupV2 = new (class {
	/**
	 * Returns `true` when the html/mathml/svg/xml tag is known.
	 *
	 * @param {string} tagName
	 * @returns {boolean}
	 */
	isKnownTag(tagName) {
		return !!solid.tags[tagName] || this.isCustomElement(tagName)
	}

	/**
	 * Returns `true` when is a custom element
	 *
	 * @param {string} tagName
	 * @returns {boolean}
	 */
	isCustomElement(tagName) {
		return tagName.includes('-')
	}

	/**
	 * Returns `true` when the html/mathml/svg/xml attribute is known
	 *
	 * @param {string} tagName
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isKnownAttribute(tagName, attributeName) {
		return (
			// web components use whatever they want
			this.isCustomElement(tagName) ||
			// data-attributes
			this.isDataAttribute(attributeName) ||
			// namespaced
			this.isNamespacedAttribute(attributeName) ||
			// attribute defined in the tag
			this.isOwnAttribute(tagName, attributeName) ||
			// global attribute
			this.isGlobalAttribute(attributeName) ||
			// custom attribute
			this.isCustomAttribute(attributeName)
		)
	}

	/**
	 * Returns `true` when the attribute is defined for the tag
	 *
	 * @param {string} tagName
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isOwnAttribute(tagName, attributeName) {
		return !!(
			solid.tags[tagName] && solid.tags[tagName][attributeName]
		)
	}

	/**
	 * Returns `true` when is a global attribute, such `tabindex`
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isGlobalAttribute(attributeName) {
		return !!solid.attributes.global[attributeName]
	}

	/**
	 * Returns `true` when is a `custom` attribute, such `ref`,
	 * `children`
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isCustomAttribute(attributeName) {
		return !!solid.attributes.custom[attributeName]
	}

	/**
	 * Returns `true` when is a `data-*` attribute
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isDataAttribute(attributeName) {
		return attributeName.startsWith('data-')
	}

	/**
	 * Returns `true` when is a namespaced attribute
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isNamespacedAttribute(attributeName) {
		return (
			this.isNamespacedEventListenerAttribute(attributeName) ||
			this.isNamespacedDirectiveAttribute(attributeName) ||
			this.isNamespacedAttrAttribute(attributeName) ||
			this.isNamespacedPropAttribute(attributeName) ||
			this.isNamespacedBoolAttribute(attributeName)
		)
	}

	/**
	 * Returns `true` when is an event listener
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isEventListenerAttribute(attributeName) {
		return (
			this.isLowerCaseEventListenerAttribute(attributeName) ||
			this.isCamelCaseEventListenerAttribute(attributeName) ||
			this.isNamespacedEventListenerAttribute(attributeName)
		)
	}
	/**
	 * Returns `true` when is a lowercase event listener
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isLowerCaseEventListenerAttribute(attributeName) {
		return /^on[a-z]/.test(attributeName)
	}
	/**
	 * Returns `true` when is a camcelCase event listener
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isCamelCaseEventListenerAttribute(attributeName) {
		return /^on[A-Z]/.test(attributeName)
	}
	/**
	 * Returns `true` when is a namespaced `on:`
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isNamespacedEventListenerAttribute(attributeName) {
		return attributeName.startsWith('on:')
	}
	/**
	 * Returns `true` when is a namespaced `use:`
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isNamespacedDirectiveAttribute(attributeName) {
		return attributeName.startsWith('use:')
	}
	/**
	 * Returns `true` when is a namespaced `attr:`
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isNamespacedAttrAttribute(attributeName) {
		return attributeName.startsWith('attr:')
	}
	/**
	 * Returns `true` when is a namespaced `prop:`
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isNamespacedPropAttribute(attributeName) {
		return attributeName.startsWith('prop:')
	}
	/**
	 * Returns `true` when is a namespaced `bool:`
	 *
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isNamespacedBoolAttribute(attributeName) {
		return attributeName.startsWith('bool:')
	}

	/**
	 * Returns `true` when is a Solid JSX BooleanAttribute
	 *
	 * @param {string} tagName
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isBooleanAttribute(tagName, attributeName) {
		const attributeType = this.getAttributeJSXType(
			tagName,
			attributeName,
		)

		return (
			this.isKnownAttribute(tagName, attributeName) &&
			attributeType === BooleanAttribute
		)
	}

	/**
	 * Returns `true` when is a Solid JSX EnumeratedPseudoBoolean
	 *
	 * @param {string} tagName
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isEnumeratedPseudoBooleanAttribute(tagName, attributeName) {
		const attributeType = this.getAttributeJSXType(
			tagName,
			attributeName,
		)

		return !!(
			this.isKnownAttribute(tagName, attributeName) &&
			attributeType &&
			attributeType.includes("'true'") &&
			attributeType.includes("'false'")
		)
	}

	/**
	 * Returns `string` with Solid JSX Type for Attribute
	 *
	 * @param {string} tagName
	 * @param {string} attributeName
	 * @returns {string}
	 */

	getAttributeJSXType(tagName, attributeName) {
		return solid.tags[tagName] && solid.tags[tagName][attributeName]
			? solid.tags[tagName][attributeName]
			: solid.attributes.global[attributeName]
	}
})()
