import solidv2 from '../data/jsx-solidv2.json' with { type: 'json' }

// https://github.com/ryansolid/dom-expressions/blob/next/packages/dom-expressions/src/jsx-h.d.ts#L795
const BooleanAttribute = solidv2.attributes.global.autofocus

export const Markup = new (class Markup {
	/**
	 * Returns `true` when solid understands the html/mathml/svg/xml
	 * tag.
	 *
	 * @param {string} tagName
	 * @returns {boolean}
	 */
	isKnownTag(tagName) {
		return !!solidv2.tags[tagName] || tagName.includes('-')
	}

	/**
	 * Returns `true` when solid understands the html/mathml/svg/xml
	 * attribute.
	 *
	 * @param {string} tagName
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isKnownAttribute(tagName, attributeName) {
		return (
			// web components use whatever they want
			tagName.includes('-') ||
			// data-attributes
			attributeName.startsWith('data-') ||
			// namespaced
			attributeName.startsWith('on:') ||
			attributeName.startsWith('use:') ||
			attributeName.startsWith('attr:') ||
			attributeName.startsWith('prop:') ||
			attributeName.startsWith('bool:') ||
			// attribute defined in the tag
			!!solidv2.tags[tagName][attributeName] ||
			// global attribute
			!!solidv2.attributes.global[attributeName] ||
			// custom attribute
			!!solidv2.attributes.custom[attributeName]
		)
	}

	/**
	 * Returns `true` when is a solid JSX BooleanAttribute
	 *
	 * @param {string} tagName
	 * @param {string} attributeName
	 * @returns {boolean}
	 */
	isBooleanAttribute(tagName, attributeName) {
		return (
			this.isKnownAttribute(tagName, attributeName) &&
			this.getAttributeJSXType(tagName, attributeName) ===
				BooleanAttribute
		)
	}

	/**
	 * Returns `true` when is a solid JSX EnumeratedPseudoBoolean
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
	 * Returns `string` with solid JSX Type for Attribute
	 *
	 * @param {string} tagName
	 * @param {string} attributeName
	 * @returns {string}
	 */

	getAttributeJSXType(tagName, attributeName) {
		return (
			solidv2.tags[tagName][attributeName] ||
			solidv2.attributes.global[attributeName]
		)
	}
})()
