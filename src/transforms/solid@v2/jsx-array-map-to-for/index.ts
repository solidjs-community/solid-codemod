import {
	ASTPath,
	CallExpression,
	FunctionExpression,
	ImportDeclaration,
	MemberExpression,
	FileInfo,
	API,
} from 'jscodeshift'

import {
	log,
	getAttributeNameAndValueFromJSXAttribute,
	getTagNameFromJSXElement,
} from '../../shared.js'

/**
 * This transform provides the following when reliable possible:
 *
 * - Trasnforms `array.map` to `<For` component
 */
export default function transformer(file: FileInfo, api: API) {
	const j = api.jscodeshift
	const root = j(file.source)

	const importsRequired = new Set<string>()

	// Replace JSX expression {<expression>.map(fn)} with <For each={expression}>{fn}</For>
	root
		.find(j.JSXExpressionContainer)
		.filter(path => {
			// We only care about JSX expression containers whose parents are JSX elements.
			// (in other words, exclude attribute expressions.)
			if (
				path.parent.node.type === 'JSXElement' &&
				path.node.expression.type === 'CallExpression'
			) {
				const call = path.node.expression
				if (
					call.callee.type === 'MemberExpression' &&
					call.callee.property.type === 'Identifier' &&
					call.callee.property.name === 'map'
				) {
					return true
				}
			}
			return false
		})
		.replaceWith(path => {
			const call = path.node.expression as CallExpression
			const callee = call.callee as MemberExpression
			importsRequired.add('For')
			return j.jsxElement.from({
				openingElement: j.jsxOpeningElement(j.jsxIdentifier('For'), [
					j.jsxAttribute.from({
						name: j.jsxIdentifier('each'),
						value: j.jsxExpressionContainer.from({
							expression: callee.object,
						}),
					}),
				]),
				closingElement: j.jsxClosingElement(j.jsxIdentifier('For')),
				selfClosing: false,
				children: [
					j.jsxExpressionContainer.from({
						expression: call.arguments.at(0) as FunctionExpression,
					}),
				],
			})
		})

	// See whether we need to add any imports
	if (importsRequired.size > 0) {
		// Look for solid-js import
		let lastImport: ASTPath<ImportDeclaration> | null = null
		let solidImport = root
			.find(j.ImportDeclaration)
			.map(path => {
				lastImport = path
				return path
			})
			.filter(path => path.node.source.value === 'solid-js')
			.forEach(path => {
				if (!path.node.specifiers) {
					path.node.specifiers = []
				}
				path.node.specifiers?.forEach(spec => {
					if (spec.type === 'ImportSpecifier') {
						importsRequired.delete(spec.imported.name)
					}
				})

				for (const symbol of importsRequired) {
					path.node.specifiers.push(
						j.importSpecifier.from({
							imported: j.jsxIdentifier(symbol),
						}),
					)
				}
			})

		if (solidImport.length == 0) {
			// Insert new solid import statement.
			const solidImport = j.importDeclaration.from({
				source: j.stringLiteral('solid-js'),
				specifiers: Array.from(importsRequired).map(symbol =>
					j.importSpecifier.from({
						imported: j.jsxIdentifier(symbol),
					}),
				),
			})
			lastImport!.insertAfter(solidImport)
		}
	}

	return root.toSource()
}
