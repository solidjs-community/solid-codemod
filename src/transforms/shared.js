import solidv2 from '../data/jsx-solidv2.json' with { type: 'json' }

/**
 * Returns `true` when solid understands the html/dom tag.
 *
 * @param {string} tagName
 * @returns {boolean}
 */
export function isValidTag(tagName) {
	return !!solidv2.tags[tagName] || tagName.includes('-')
}

/**
 * Returns `true` when solid understands the html/dom attribute.
 *
 * @param {string} tagName
 * @param {string} attributeName
 * @returns {boolean}
 */
export function isValidAttribute(tagName, attributeName) {
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
		// tag attribute
		!!solidv2.tags[tagName][attributeName] ||
		// global attribute
		!!solidv2.attributes.global[attributeName] ||
		// custom attribute
		!!solidv2.attributes.custom[attributeName]
	)
}
