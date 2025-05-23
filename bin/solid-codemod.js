#!/usr/bin/env node

import path from 'path'
import { fileURLToPath } from 'url'

import { runTransformer } from './run-transformer.js'
import {
	blue,
	copy,
	diffFiles,
	getDirectories,
	getFiles,
	green,
	log,
	prettier,
	read,
	red,
} from './utils.js'

// program

blue('SolidJS Codemod')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.on('exit', () => console.log())

// get transformers list

const transformersDirectory = path.join(
	__dirname,
	'../',
	'transforms',
)

const transformers = /** @type string[] */ getDirectories(
	transformersDirectory,
)
	.map(version =>
		getDirectories(path.join(transformersDirectory, version)).map(x =>
			path.join(version, x).replace(/\\/g, '/'),
		),
	)
	.flat(Infinity)

// get input

const input = {
	/** @type {string[]} */
	transformers: [],
	/** @type {undefined | string[]} */
	target: undefined,
	/** @type {string[]} */
	files: [],
	/** @type {string[]} */
	JSFiles: [],
	/** @type {string[]} */
	TSFiles: [],
	write: false,
}

// naive but accepts array of transformers and array of paths

for (const item of process.argv.slice(2)) {
	switch (item) {
		case '-t':
		case '--target': {
			input.target = []
			break
		}
		case '-w':
		case '--write': {
			input.write = true
			input.target = input.target || []
			break
		}
		default: {
			input.target
				? input.target.push(item)
				: input.transformers.push(item)
			break
		}
	}
}

// validate if transformers exists

input.transformers.forEach(x => {
	if (!transformers.includes(x)) {
		red(`Transformer "${x}" doesn't exists`)

		green(`Possible transformer values`)

		log(transformers.map(x => ' - ' + x).join('\n'))

		process.exit(1)
	}
})

// run transformers on user files

if (input.transformers.length) {
	// default to current directory

	input.target =
		input.target && input.target.length ? input.target : ['.']

	// get files

	input.files = getFiles(input.target)

	input.JSFiles = input.files.filter(x => /\.(jsx|js)$/.test(x))
	input.TSFiles = input.files.filter(x => /\.(tsx|ts)$/.test(x))

	blue('Running Transforms...\n')

	for (const transformer of input.transformers) {
		const transformerFile = path.join(
			transformersDirectory,
			transformer,
			'index.js',
		)

		const promises = []

		for (const files of [input.JSFiles, input.TSFiles]) {
			if (files.length) {
				promises.push(
					runTransformer({
						files,
						transformerFile,
						flags: input,
					}),
				)
			}
		}

		// just in case await the current trnasform to go to the next one
		await Promise.all(promises)
	}

	green('DONE')
	process.exit()
}

// run transformers on test files

blue('Running Transform Tests..\n')

process.chdir(path.dirname(__dirname))

for (const transformer of transformers) {
	const transformerDirectory = path.join(
		transformersDirectory,
		transformer,
	)

	const transformerFile = path.join(transformerDirectory, 'index.js')

	const tests = getFiles(
		path.join(transformerDirectory, 'test'),
	).filter(x => /input\.(js|jsx|ts|tsx)$/.test(x))

	for (const test of tests) {
		const tmp = test.replace('input.', 'tmp.output.')
		const output = test.replace('input.', 'output.')

		prettier(test)
		prettier(output)

		const expected = read(output)

		copy(test, tmp)

		await runTransformer({
			files: [tmp],
			transformerFile,
			flags: { write: true },
		})

		prettier(tmp)

		const result = read(tmp)

		if (result !== expected) {
			red("Test Failed, output doesn't match!")

			blue('    ' + test)

			console.log(
				diffFiles(
					{ name: output, content: expected },
					{ name: tmp, content: result },
				),
			)

			process.exit(1)
		} else {
			green(test)
		}
	}

	green('DONE')
}
