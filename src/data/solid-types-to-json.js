import { read, write } from '../utils.js'

const test = false

// data

const o = JSON.parse(
	!test
		? await fetch(
				'https://raw.githubusercontent.com/potahtml/namespace-jsx-project/refs/heads/master/jsx/data.json',
			).then(x => x.text())
		: read('./test-data.json'),
)

const solidv2 = 'Solid Next'

const result = {
	tags: {},
	attributes: {
		global: {},
		custom: {
			ref: true,
			children: true,
		},
	},
}

// tags data

for (const ns in o.elements) {
	for (const tag in o.elements[ns]) {
		result.tags[tag] = result.tags[tag] || {}
		for (const [key, entry] of Object.entries(
			o.elements[ns][tag].keys,
		)) {
			const value = entry.values[solidv2]
			if (value) {
				result.tags[tag][key] = value
			}
		}
	}
}

// globals data

for (const interfaceName of [
	'Element',
	'HTMLElement',
	'MathMLElement',
	'SVGElement',
]) {
	for (const [key, entry] of Object.entries(
		o.keys[interfaceName].keys,
	)) {
		const value = entry.values[solidv2]
		if (value) {
			result.attributes.global[key] = value
		}
	}
}

// save

write('jsx-solidv2.json', JSON.stringify(result, null, 2))
