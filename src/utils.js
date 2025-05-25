import fs from 'fs'
import path from 'path'
import { execSync as $ } from 'child_process'
import { fileURLToPath } from 'url'

import chalk from 'chalk'
import diff from 'cli-diff'

const __filename = fileURLToPath(import.meta.url)
export const root = path.dirname(path.dirname(__filename))

export const log = string => console.log('\n' + string)
export const red = string => log(chalk.redBright(string))
export const blueBright = string => log(chalk.cyanBright(string))
export const blue = string => log(chalk.cyan(string))
export const green = string => log(chalk.greenBright(string))

export const read = path =>
	fs.readFileSync(path, { encoding: 'utf8' })

export const write = (path, content) =>
	fs.writeFileSync(path, content)

export const copy = (source, destination) =>
	fs.copyFileSync(source, destination)

export const exists = path => fs.existsSync(path)

export const remove = path => {
	try {
		fs.rmSync(path)
	} catch (e) {}
}

/** @returns {string[]} */
export const getFiles = (...args) =>
	/** @type {string[]} */
	[
		...new Set(
			args
				.flat(Infinity)
				.map(a => getFilesRecurse(a))
				.flat(Infinity),
		),
	].filter(x => /\.(tsx|ts|jsx|js)$/.test(x))

/** @returns {string[]} */
const getFilesRecurse = (source, files = []) => {
	if (!fs.existsSync(source)) {
		throw new Error(`path "${source}" doesn't exists`)
	}

	if (/(\.git|node_modules)/.test(source)) {
	} else if (fs.statSync(source).isDirectory()) {
		for (const file of fs.readdirSync(source)) {
			getFilesRecurse(path.join(source, file), files)
		}
	} else {
		files.push(source)
	}
	return files
}

/** @returns {string[]} */
export const getDirectories = source =>
	/** @type {string[]} */ fs
		.readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)

export const prettier = file =>
	$(
		`prettier "${file}" --write --config "${root}/package.json" --no-editorconfig --ignore-path="false"`,
	)

export const diffFiles = (a, b) => (diff.default || diff)(a, b)
