import path from 'path'

import {
	blue,
	copy,
	diffFiles,
	exists,
	getDirectories,
	getFiles,
	green,
	prettier,
	read,
	red,
	root,
} from '../utils.js'
import { runTransformer } from './run-transformer.js'

// program

blue('SolidJS Codemod')

process.on('exit', () => console.log())

// get transformers list

const transformersDirectory = path.join(root, 'src', 'transforms')

const transformers =
	/** @type string[] */
	getDirectories(transformersDirectory)
		.map(version =>
			getDirectories(path.join(transformersDirectory, version)).map(
				// windows won't match `solid-js@2\\transform-name`
				x => path.join(version, x).replace(/\\/g, '/'),
			),
		)
		.flat(Infinity)

// get input

const input = {
	write: false,
	/** @type {string[]} */
	transformers: [],
	/** @type {string[]} */
	paths: [],
}

// naive but accepts array of transformers and array of paths

for (const item of process.argv.slice(2)) {
	switch (item) {
		case '-w':
		case '--write': {
			input.write = true
			break
		}
		default: {
			transformers.includes(item)
				? input.transformers.push(item)
				: input.paths.push(item)
			break
		}
	}
}

// run transformers on user files

if (input.paths.length && input.transformers.length) {
	// get files

	const files = getFiles(input.paths)

	// group by type

	const JSFiles = files.filter(x => /\.(jsx|js)$/.test(x))
	const TSFiles = files.filter(x => /\.(tsx|ts)$/.test(x))

	blue('Running Transforms...\n')

	for (const transformer of input.transformers) {
		const transformerFile = path.join(
			transformersDirectory,
			transformer,
			'index.js',
		)

		const promises = []

		for (const files of [JSFiles, TSFiles]) {
			if (files.length) {
				promises.push(
					runTransformer(transformerFile, files, input.write),
				)
			}
		}

		// await the current trnasform to go to the next one
		// as these may edit the same files
		await Promise.all(promises)
	}

	green('DONE')
	process.exit()
}

// run transformers test files

blue('Running Transform Tests..\n')

// run on selected transforms, or on all if nothing is selected
// @ts-ignore
input.transformers = input.transformers.length
	? input.transformers
	: transformers

for (const transformer of input.transformers) {
	const transformerDirectory = path.join(
		transformersDirectory,
		transformer,
	)

	const transformerFile = path.join(transformerDirectory, 'index.js')
	const transformerTestDirectory = path.join(
		transformerDirectory,
		'test',
	)

	if (!exists(transformerTestDirectory)) {
		continue
	}

	const tests = getFiles(transformerTestDirectory).filter(x =>
		/input\.(js|jsx|ts|tsx)$/.test(x),
	)

	for (const testFile of tests) {
		const outputFile = testFile.replace('input.', 'output.')
		const expectedFile = testFile.replace('input.', 'expected.')

		prettier(testFile)
		prettier(expectedFile)

		const expected = read(expectedFile)

		copy(testFile, outputFile)

		await runTransformer(transformerFile, [outputFile], true)

		prettier(outputFile)

		const result = read(outputFile)

		if (result !== expected) {
			red("Test Failed, output doesn't match!")

			blue('    ' + testFile)

			console.log(
				diffFiles(
					{ name: expectedFile, content: expected },
					{ name: outputFile, content: result },
				),
			)

			process.exit(1)
		} else {
			green(testFile)
		}
	}
}

green('DONE')
