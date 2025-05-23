import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'

import { red } from './utils.js'

const require = createRequire(import.meta.url)
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift')

export async function runTransformer({
	files,
	transformerFile,
	flags = {},
}) {
	const parser = /(tsx|ts)$/.test(files[0]) ? 'tsx' : 'babel'

	let args = [jscodeshiftExecutable]

	if (!flags.write) {
		args.push('--dry')
	}

	args.push('--verbose', '0')

	args.push('--ignore-pattern=**/node_modules/**')

	args.push('--parser', parser)

	parser === 'tsx'
		? args.push('--extensions=tsx,ts,jsx,js')
		: args.push('--extensions=jsx,js')

	args = args.concat(['--transform', transformerFile])

	args.push('--stdin')

	const result = { stdout: '', stderr: '' }

	const child = spawn('node', args)

	child.stdout.on('data', chunk => {
		process.stdout.write(chunk)
		result.stdout += chunk
	})
	child.stderr.on('data', chunk => {
		process.stderr.write(chunk)
		result.stderr += chunk
	})

	child.stdin.write(files.map(x => `${x}`).join('\n'))
	child.stdin.end()

	return new Promise((resolve, reject) => {
		child.on('exit', exitCode => {
			if (exitCode) {
				red(result.stderr)
				process.exit(1)
			}
			resolve(undefined)
		})
	})
}
