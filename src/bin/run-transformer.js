import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'

const require = createRequire(import.meta.url)
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift')

/**
 * To make `process.(stdout/stdin).write` display colors on `wsl` and
 * possibly other places. Although I am not sure if this is my
 * personal config that needs to be set to display colors.
 */
process.env.FORCE_COLOR = '1'

export async function runTransformer(transformer, files, write) {
	const parser = /(tsx|ts)$/.test(files[0]) ? 'tsx' : 'babel'

	const args = [
		jscodeshiftExecutable,
		'--verbose=0',
		'--ignore-pattern=**/node_modules/**',
		'--parser',
		parser,
		'--transform',
		transformer,
		'--stdin',
	]

	if (!write) {
		args.push('--dry')
	}

	parser === 'tsx'
		? args.push('--extensions=tsx,ts,jsx,js')
		: args.push('--extensions=jsx,js')

	const child = spawn('node', args)

	child.stdout.on('data', chunk => {
		process.stdout.write(chunk)
		if (chunk.toString().includes('ERR')) {
			process.exit(1)
		}
	})
	child.stderr.on('data', chunk => process.stderr.write(chunk))

	child.stdin.write(files.join('\n'))
	child.stdin.end()

	return new Promise((resolve, reject) => {
		child.on('exit', resolve)
	})
}
