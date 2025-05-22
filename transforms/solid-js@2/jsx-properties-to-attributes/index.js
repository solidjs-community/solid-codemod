// Im just testing, actually need to write the transform now

export default function transformer(file, api) {
	const j = api.jscodeshift
	const root = j(file.source)

	root.find(j.JSXAttribute).forEach(path => {
		if (path.node.name.name === 'disableRemotePlayback') {
			path.node.name = j.jsxIdentifier('disableremoteplayback')
		}
	})

	return root.toSource()
}
