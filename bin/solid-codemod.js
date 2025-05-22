#!/usr/bin/env node

import path from 'path'
import { fileURLToPath } from 'url'
import { exit } from 'process'
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'

import diff from 'cli-diff'

const diffFiles = diff.default || diff

import {
	blue,
	copy,
	getDirectories,
	glob,
	green,
	log,
	prettier,
	read,
	red,
} from './utils.js'

// program

blue('SolidJS Codemod')

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift')

// get transformers list

const transformersDirectory = path.join(
	__dirname,
	'../',
	'transforms',
)

const transformers = getDirectories(transformersDirectory)
	.map(version =>
		getDirectories(path.join(transformersDirectory, version)).map(x =>
			path.join(version, x).replace(/\\/g, '/'),
		),
	)
	.flat(Infinity)

// get input

const input = {
	transformers: [],
	target: false,
	write: false,
	files: [],
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

		log(`Possible transformer values`)

		green(transformers.map(x => ' - ' + x).join('\n') + '\n')

		exit(1)
	}
})

// default to current directory

input.target = input.target || ['.']

// get files

input.files = glob(input.target)

input.JSFiles = input.files.filter(x => /(jsx|js)$/.test(x))
input.TSFiles = input.files.filter(x => /(tsx|ts)$/.test(x))

// run transformers

if (!input.transformers.length) {
	// run only tests files
	blue('Running tests..\n')

	process.chdir(path.dirname(__dirname))

	// run transformers
	transformers.forEach(async transformer => {
		const transformerDirectory = path.join(
			transformersDirectory,
			transformer,
		)

		const transformerFile = path.join(
			transformerDirectory,
			'index.js',
		)

		const tests = glob(
			path.join(transformerDirectory, 'test'),
		).filter(x => /input\.(js|jsx|ts|tsx)$/.test(x))

		tests.forEach(async test => {
			const tmp = test.replace('input.', 'tmp.output.')
			const output = test.replace('input.', 'output.')

			prettier(test)
			prettier(output)

			const expected = read(output)

			copy(test, tmp)

			runTransformer({
				files: [tmp],
				transformerFile,
				flags: { write: true },
			}).then(() => {
				prettier(tmp)

				const result = read(tmp)

				if (result !== expected) {
					blue(test)
					red('Test Failed, output wont match!\n')
					console.log(
						diffFiles(
							{ name: output, content: expected },
							{ name: tmp, content: result },
						),
					)

					exit()
				} else {
					green(test)
				}
			})
		})
	})
} else {
	// run transformers on user files
	input.transformers.forEach(async transformer => {
		const transformerFile = path.join(
			transformersDirectory,
			transformer,
			'index.js',
		)

		for (const files of [input.JSFiles, input.TSFiles]) {
			if (files.length) {
				const result = await runTransformer({
					files,
					transformerFile,
					flags: input,
				})
			}
		}
	})
}

async function runTransformer({
	files,
	transformerFile,
	flags = {},
}) {
	const parser = /(tsx|ts)$/.test(files[0]) ? 'tsx' : 'babel'

	let args = [jscodeshiftExecutable]

	if (!flags.write) {
		args.push('--dry')
	}

	args.push('--verbose', 2)

	args.push('--ignore-pattern=**/node_modules/**')

	args.push('--parser', parser)

	if (parser === 'tsx') {
		args.push('--extensions=tsx,ts,jsx,js')
	} else {
		args.push('--extensions=jsx,js')
	}

	args = args.concat(['--transform', transformerFile])

	args = args.concat(files)

	const child = spawn('node', args)

	const result = { stdout: '', stderr: '' }

	for await (const chunk of child.stdout) {
		console.log(chunk.toString().trim())
		result.stdout += chunk
	}

	for await (const chunk of child.stderr) {
		result.stderr += chunk
	}
	const exitCode = await new Promise((resolve, reject) => {
		child.on('close', resolve)
	})

	if (exitCode) {
		red(result.stderr)
		exit()
	}
	return result
}
