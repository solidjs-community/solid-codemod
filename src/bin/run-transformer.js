import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'

const require = createRequire(import.meta.url)
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift')

/**
 * To make `process.(stdout/stdin).write` display colors on `wsl` and
 * possibly other places. Although I am not sure if this is my
 * personal config that needs to be set to display colors, instead of
 * forcing the colors.
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
		if (chunk.toString().includes('ERR')) {
			process.stdout.write(chunk)
			process.exit(1)
		}
		queueMicrotask(() => process.stdout.write(chunk))
	})
	child.stderr.on('data', chunk =>
		queueMicrotask(() => process.stderr.write(chunk)),
	)

	child.stdin.write(files.join('\n'))
	child.stdin.end()

	return new Promise((resolve, reject) => {
		child.on('exit', resolve)
	})
}
